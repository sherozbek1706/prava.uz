import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FileQuestion,
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  X,
  Upload,
  Check,
  Save,
  RotateCcw
} from 'lucide-react';

export default function AdminQuestions() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null); // null if creating, question object if editing

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Yo\'l belgilari');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [options, setOptions] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchQuestions();
  }, [isAuthenticated, isAdmin, navigate, categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/questions', { params });
      if (res.data.success) {
        setQuestions(res.data.questions || []);
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating new question
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setTitle('');
    setDescription('');
    setCategory('Yo\'l belgilari');
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setOptions([
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]);
    setModalError('');
    setShowModal(true);
  };

  // Open modal for editing existing question
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setTitle(q.title || '');
    setDescription(q.description || '');
    setCategory(q.category || 'Yo\'l belgilari');
    setImageFile(null);
    setImagePreview(q.image_url || null);
    setRemoveExistingImage(false);

    if (q.options && q.options.length > 0) {
      setOptions(
        q.options.map((opt) => ({
          text: opt.option_text,
          is_correct: Boolean(opt.is_correct),
        }))
      );
    } else {
      setOptions([
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ]);
    }

    setModalError('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveExistingImage(false);
    }
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (editingQuestion && editingQuestion.image_url) {
      setRemoveExistingImage(true);
    }
  };

  // Add an option (up to 5)
  const addOption = () => {
    if (options.length >= 5) {
      alert('Savolda eng ko\'pi bilan 5 ta variant bo\'lishi mumkin.');
      return;
    }
    setOptions([...options, { text: '', is_correct: false }]);
  };

  // Remove an option (minimum 2)
  const removeOption = (indexToRemove) => {
    if (options.length <= 2) {
      alert('Savolda kamida 2 ta variant bo\'lishi shart.');
      return;
    }
    const newOpts = options.filter((_, idx) => idx !== indexToRemove);
    if (options[indexToRemove].is_correct && newOpts.length > 0) {
      newOpts[0].is_correct = true;
    }
    setOptions(newOpts);
  };

  const handleOptionTextChange = (idx, text) => {
    const newOpts = [...options];
    newOpts[idx].text = text;
    setOptions(newOpts);
  };

  const setCorrectOption = (correctIdx) => {
    const newOpts = options.map((opt, idx) => ({
      ...opt,
      is_correct: idx === correctIdx,
    }));
    setOptions(newOpts);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim()) {
      setModalError('Savol matnini kiriting.');
      return;
    }

    if (options.length < 2 || options.length > 5) {
      setModalError('Variantlar soni 2 dan 5 tagacha bo\'lishi kerak.');
      return;
    }

    for (let i = 0; i < options.length; i++) {
      if (!options[i].text.trim()) {
        setModalError(`${i + 1}-variant matnini to'ldiring.`);
        return;
      }
    }

    const correctCount = options.filter((o) => o.is_correct).length;
    if (correctCount !== 1) {
      setModalError('Aynan 1 ta to\'g\'ri javobni belgilashingiz kerak.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category.trim());
      formData.append(
        'options',
        JSON.stringify(
          options.map((o) => ({
            option_text: o.text.trim(),
            is_correct: o.is_correct,
          }))
        )
      );

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeExistingImage) {
        formData.append('remove_image', 'true');
      }

      let res;
      if (editingQuestion) {
        // PUT update question
        res = await api.put(`/questions/${editingQuestion.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // POST create question
        res = await api.post('/questions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setShowModal(false);
        fetchQuestions();
      }
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Savolni saqlashda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Haqiqatdan ham ushbu savolni o\'chirmoqchimisiz?')) return;

    try {
      const res = await api.delete(`/questions/${id}`);
      if (res.data.success) {
        setQuestions(questions.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert('Savolni o\'chirishda xatolik yuz berdi.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/dashboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Savollar Boshqaruvi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Jami bazada: <span className="text-amber-400 font-bold">{questions.length}</span> ta savol mavjud (Tahrirlash va O'chirish)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi savol qo'shish (Multer)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            placeholder="Savol matni bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={fetchQuestions}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Qidirish
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Savollar yuklanmoqda...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Savollar topilmadi</h3>
          <p className="text-xs text-slate-400">Hech qanday savol kiritilmagan yoki qidiruv natijasi bo'sh.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-lg relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {qIndex + 1}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700 inline-block mb-1">
                      {q.category || 'Umumiy'}
                    </span>
                    <h4 className="font-bold text-white text-base leading-snug">{q.title}</h4>
                    {q.description && (
                      <p className="text-xs text-slate-400 mt-1">{q.description}</p>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    title="Savolni tahrirlash (Edit)"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500/40 transition text-xs font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Savolni o'chirish"
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900/50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Image (if uploaded via multer) */}
              {q.image_url && (
                <div className="max-w-xs p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <img
                    src={q.image_url}
                    alt="Savol rasmi"
                    className="max-h-36 object-contain rounded"
                  />
                </div>
              )}

              {/* Options (2-5 options) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options?.map((opt, optIdx) => (
                  <div
                    key={opt.id || optIdx}
                    className={`p-3 rounded-xl text-xs border flex items-center justify-between ${
                      opt.is_correct
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold opacity-60">
                        {String.fromCharCode(65 + optIdx)})
                      </span>
                      <span>{opt.option_text}</span>
                    </div>
                    {opt.is_correct && (
                      <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-bold ml-2">
                        <Check className="w-3.5 h-3.5" />
                        <span>To'g'ri</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Question with Multer Upload & 2-5 Options */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full my-8 p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {editingQuestion ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingQuestion ? `Savolni Tahrirlash (#${editingQuestion.id})` : 'Yangi Savol Qo\'shish'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Multer orqali rasm va 2-5 ta variant (1 ta to'g'ri javob)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitQuestion} className="space-y-5">
              {/* Question Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Savol Matni *
                </label>
                <textarea
                  required
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Ushbu yo'l belgisi nimani bildiradi?"
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Kategoriya
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Masalan: Taqiqlovchi belgilar"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Qoida Izohi / Tavsif
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Qoida bandi (ixtiyoriy)"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Image Upload with Multer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Savol Rasmi (Multer orqali saqlanadi)
                </label>
                {imagePreview ? (
                  <div className="relative p-3 bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-between">
                    <img
                      src={imagePreview}
                      alt="Tanlangan rasm"
                      className="max-h-24 max-w-xs object-contain rounded-lg"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition">
                        <span>O'zgartirish</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition text-xs font-semibold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>O'chirish</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl bg-slate-950/60 cursor-pointer transition">
                    <Upload className="w-8 h-8 text-amber-400/80 mb-2" />
                    <span className="text-xs font-semibold text-white">
                      Rasm yuklash uchun bosing (JPG, PNG, WEBP, SVG)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Multer orqali serverda xavfsiz saqlanadi
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Dynamic Options Builder (2 to 5 options, 1 correct) */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Javob Variantlari ({options.length} / 5 ta)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Variantlardan faqat bittasini to'g'ri deb belgilang.
                    </p>
                  </div>
                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Variant qo'shish</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border transition ${
                          opt.is_correct
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        {/* Radio selector for 1 correct option */}
                        <button
                          type="button"
                          onClick={() => setCorrectOption(idx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border transition flex-shrink-0 ${
                            opt.is_correct
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                          title={opt.is_correct ? "To'g'ri javob" : "To'g'ri javob qilib belgilash"}
                        >
                          {letter}
                        </button>

                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          placeholder={`${letter} varianti matnini yozing...`}
                          className="flex-1 bg-transparent border-none text-white text-xs placeholder-slate-600 focus:outline-none px-2"
                        />

                        {opt.is_correct ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            To'g'ri javob
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCorrectOption(idx)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 px-1"
                          >
                            To'g'ri qilish
                          </button>
                        )}

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Saqlanmoqda...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingQuestion ? 'O\'zgarishlarni saqlash' : 'Savolni saqlash'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
