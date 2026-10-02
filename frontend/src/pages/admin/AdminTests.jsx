import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/client';
import {
  Layers,
  Plus,
  Trash2,
  Pencil,
  FileQuestion,
  Clock,
  Award,
  CheckCircle2,
  X,
  AlertCircle,
  Search,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  Eye,
  Check
} from 'lucide-react';

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Test Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Biletlar');
  const [timeLimit, setTimeLimit] = useState(20);
  const [passPercentage, setPassPercentage] = useState(90);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testModalError, setTestModalError] = useState('');

  // Manage Questions for a Test Modal State
  const [activeTest, setActiveTest] = useState(null); // The test being managed
  const [testQuestions, setTestQuestions] = useState([]);
  const [loadingTestQuestions, setLoadingTestQuestions] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [availableSearch, setAvailableSearch] = useState('');
  const [assignmentError, setAssignmentError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tests/admin/all');
      if (res.data.success) {
        setTests(res.data.tests || []);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Test modal
  const handleOpenCreateTest = () => {
    setEditingTest(null);
    setTitle('');
    setDescription('');
    setCategory('Biletlar');
    setTimeLimit(20);
    setPassPercentage(90);
    setTestModalError('');
    setShowTestModal(true);
  };

  // Open Edit Test modal
  const handleOpenEditTest = (test) => {
    setEditingTest(test);
    setTitle(test.title || '');
    setDescription(test.description || '');
    setCategory(test.category || 'Biletlar');
    setTimeLimit(test.time_limit_minutes || 20);
    setPassPercentage(test.pass_percentage || 90);
    setTestModalError('');
    setShowTestModal(true);
  };

  // Submit Create or Edit Test
  const handleSubmitTest = async (e) => {
    e.preventDefault();
    setTestModalError('');

    if (!title.trim()) {
      setTestModalError('Test sarlavhasi kiritilishi shart.');
      return;
    }

    setSubmittingTest(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        time_limit_minutes: Number(timeLimit) || 20,
        pass_percentage: Number(passPercentage) || 90,
      };

      let res;
      if (editingTest) {
        res = await api.put(`/tests/${editingTest.id}`, payload);
      } else {
        res = await api.post('/tests', payload);
      }

      if (res.data.success) {
        setShowTestModal(false);
        fetchTests();
      }
    } catch (err) {
      setTestModalError(err?.response?.data?.message || 'Testni saqlashda xatolik yuz berdi.');
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Haqiqatdan ham ushbu testni (biletni) o\'chirmoqchimisiz?')) return;

    try {
      const res = await api.delete(`/tests/${testId}`);
      if (res.data.success) {
        setTests(tests.filter((t) => t.id !== testId));
        if (activeTest && activeTest.id === testId) {
          setActiveTest(null);
        }
      }
    } catch (err) {
      alert('Testni o\'chirishda xatolik yuz berdi.');
    }
  };

  // Open Manage Questions Modal for a Test
  const handleOpenManageQuestions = async (test) => {
    setActiveTest(test);
    setAssignmentError('');
    setAvailableSearch('');
    await loadTestQuestions(test.id);
    await loadAvailableQuestions(test.id, '');
  };

  const loadTestQuestions = async (testId) => {
    try {
      setLoadingTestQuestions(true);
      const res = await api.get(`/tests/${testId}`);
      if (res.data.success) {
        setTestQuestions(res.data.test?.questions || []);
      }
    } catch (err) {
      console.error('Error loading test questions:', err);
    } finally {
      setLoadingTestQuestions(false);
    }
  };

  const loadAvailableQuestions = async (testId, searchKeyword = '') => {
    try {
      setLoadingAvailable(true);
      const res = await api.get(`/tests/${testId}/available-questions`, {
        params: { search: searchKeyword.trim() },
      });
      if (res.data.success) {
        setAvailableQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.error('Error loading available questions:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Add question to active test
  // Requirement: "bitta savol xoxlagancha testni ichiga joylashishi mumkin. Lekin bitta testni ichida har doim 1 id dagi savoldan bitta bulishi kerak."
  const handleAddQuestionToTest = async (questionId) => {
    if (!activeTest) return;
    setAssignmentError('');

    try {
      const res = await api.post(`/tests/${activeTest.id}/questions`, {
        question_id: questionId,
      });

      if (res.data.success) {
        // Refresh both lists
        await loadTestQuestions(activeTest.id);
        await loadAvailableQuestions(activeTest.id, availableSearch);
        fetchTests(); // Refresh count in main table
      }
    } catch (err) {
      setAssignmentError(err?.response?.data?.message || 'Savolni testga qo\'shishda xatolik yuz berdi.');
    }
  };

  // Remove question from active test (does not delete from global DB)
  const handleRemoveQuestionFromTest = async (questionId) => {
    if (!activeTest) return;
    if (!window.confirm('Savol ushbu testdan chiqarilsinmi? (Savol bazadan o\'chib ketmaydi)')) return;

    try {
      const res = await api.delete(`/tests/${activeTest.id}/questions/${questionId}`);
      if (res.data.success) {
        await loadTestQuestions(activeTest.id);
        await loadAvailableQuestions(activeTest.id, availableSearch);
        fetchTests();
      }
    } catch (err) {
      alert('Savolni testdan chiqarishda xatolik.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Imtihon Biletlari Boshqaruvi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Testlar va Biletlar To'plami
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bitta savolni istalgancha testga biriktirish mumkin, lekin bitta test ichida savol takrorlanmaydi.
          </p>
        </div>

        <button
          onClick={handleOpenCreateTest}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Bilet / Test Yaratish</span>
        </button>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Testlar ro'yxati yuklanmoqda...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Biletlar mavjud emas</h3>
          <p className="text-xs text-slate-400">Yangi bilet yarating va unga savollarni biriktiring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-5 shadow-xl relative group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {test.category || 'Bilet'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditTest(test)}
                      title="Testni tahrirlash"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      title="Testni o'chirish"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-300 transition">
                  {test.title}
                </h3>

                {test.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {test.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Savollar soni:</span>
                    <span className="text-base font-black text-amber-400">
                      {test.questions_count} <span className="text-xs font-normal text-slate-500">ta</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Vaqt & Chegara:</span>
                    <span className="text-xs font-bold text-white">
                      {test.time_limit_minutes} daq / {test.pass_percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Manage Questions button */}
              <button
                onClick={() => handleOpenManageQuestions(test)}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-bold transition shadow-sm"
              >
                <FileQuestion className="w-4 h-4 text-amber-400" />
                <span>Savollarni biriktirish ({test.questions_count})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Create or Edit Test */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative max-w-md w-full p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {editingTest ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingTest ? 'Testni Tahrirlash' : 'Yangi Bilet / Test Yaratish'}
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {testModalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{testModalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Test / Bilet Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: 4-Bilet: To'xtash va to'xtab turish"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Qisqacha Izoh / Tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ushbu biletda qamrab olingan mavzular haqida qisqacha..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Vaqt (daqiqa)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    O'tish chegarasi (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingTest}
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20"
                >
                  {submittingTest ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Questions inside a Test */}
      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-4xl w-full my-6 p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Test Tarkibidagi Savollar
                </span>
                <h3 className="text-xl font-bold text-white">{activeTest.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Biletda hozirda <span className="text-amber-400 font-bold">{testQuestions.length}</span> ta savol biriktirilgan.
                </p>
              </div>
              <button
                onClick={() => setActiveTest(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignmentError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{assignmentError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Currently Assigned Questions (6 cols) */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Biriktirilgan Savollar ({testQuestions.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Test ichida</span>
                </div>

                {loadingTestQuestions ? (
                  <div className="py-8 text-center text-xs text-slate-400">Yuklanmoqda...</div>
                ) : testQuestions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    Bu testda hali hech qanday savol yo'q. O'ng tomondan savollarni tanlang va qo'shing.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {testQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white leading-snug">{q.title}</p>
                            <span className="text-[10px] text-slate-500 mt-0.5 block">
                              ID: {q.id} • {q.options?.length || 0} ta variant
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveQuestionFromTest(q.id)}
                          title="Savolni ushbu testdan chiqarish"
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition flex-shrink-0"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Available Questions to Add (6 cols) */}
              <div className="lg:col-span-6 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6 pt-4 lg:pt-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Bazada Mavjud Savollar ({availableQuestions.length})
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    1-Click bilan qo'shish
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={availableSearch}
                    onChange={(e) => {
                      setAvailableSearch(e.target.value);
                      loadAvailableQuestions(activeTest.id, e.target.value);
                    }}
                    placeholder="Savollarni qidirish..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {loadingAvailable ? (
                  <div className="py-8 text-center text-xs text-slate-400">Yuklanmoqda...</div>
                ) : availableQuestions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    Barcha mavjud savollar allaqachon ushbu testga biriktirilgan yoki qidiruv bo'yicha topilmadi.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {availableQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 text-xs transition"
                      >
                        <div className="flex items-start space-x-2">
                          {q.image_url ? (
                            <img
                              src={getImageUrl(q.image_url)}
                              alt=""
                              className="w-8 h-8 rounded object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 flex-shrink-0">
                              <FileQuestion className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-200 leading-snug">{q.title}</p>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Kategoriya: {q.category || 'Umumiy'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddQuestionToTest(q.id)}
                          title="Savolni ushbu testga qo'shish"
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition flex-shrink-0 border border-emerald-500/30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Qo'shish</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setActiveTest(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
