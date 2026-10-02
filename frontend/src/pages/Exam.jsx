import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Maximize2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';

export default function Exam() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Test Selection state
  const testIdParam = searchParams.get('test_id');
  const [selectedTestId, setSelectedTestId] = useState(testIdParam || null);
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(!testIdParam);

  // Active Exam state
  const [activeTestInfo, setActiveTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  // Auth requirement
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/exam' } } });
    }
  }, [isAuthenticated, navigate]);

  // Load available tests/biletlar
  useEffect(() => {
    const fetchAvailableTests = async () => {
      try {
        setLoadingTests(true);
        const res = await api.get('/tests');
        if (res.data.success) {
          setAvailableTests(res.data.tests || []);
        }
      } catch (err) {
        console.error('Error fetching tests:', err);
      } finally {
        setLoadingTests(false);
      }
    };

    if (isAuthenticated) {
      fetchAvailableTests();
    }
  }, [isAuthenticated]);

  // Load questions when a test is selected or started
  useEffect(() => {
    if (!selectedTestId && selectedTestId !== 'random') return;

    const startExamSession = async () => {
      try {
        setLoadingQuestions(true);
        setError('');
        setAnswers({});
        setCurrentIndex(0);

        let url = '/exams/questions';
        if (selectedTestId === 'random') {
          url += '?count=10';
        } else {
          url += `?test_id=${selectedTestId}`;
        }

        const res = await api.get(url);
        if (res.data.success && res.data.questions?.length > 0) {
          setQuestions(res.data.questions);
          setActiveTestInfo(res.data.test || null);
          const limitMin = res.data.test?.time_limit_minutes || 20;
          setTimeLeft(limitMin * 60);
        } else {
          setError(res.data.message || 'Ushbu testda savollar topilmadi.');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Savollarni yuklab bo\'lmadi.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    startExamSession();
  }, [selectedTestId]);

  // Timer countdown
  useEffect(() => {
    if (loadingQuestions || questions.length === 0 || submitting || !selectedTestId) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadingQuestions, questions, submitting, selectedTestId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSelectTest = (testId) => {
    setSelectedTestId(testId);
    setSearchParams(testId === 'random' ? {} : { test_id: testId });
  };

  const handleBackToTests = () => {
    if (Object.keys(answers).length > 0) {
      if (!window.confirm('Testni to\'xtatib boshqa bilet tanlamoqchimisiz?')) return;
    }
    setSelectedTestId(null);
    setSearchParams({});
    setQuestions([]);
    setActiveTestInfo(null);
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const payloadAnswers = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] || null,
      }));

      const totalTime = (activeTestInfo?.time_limit_minutes || 20) * 60;
      const timeSpent = Math.max(0, totalTime - timeLeft);

      const res = await api.post('/exams/submit', {
        answers: payloadAnswers,
        time_spent_seconds: timeSpent,
        test_id: selectedTestId === 'random' ? null : Number(selectedTestId),
      });

      if (res.data.success) {
        navigate('/exam/result', { state: { examResult: res.data.exam } });
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Natijani yuborishda xatolik yuz berdi.');
      setSubmitting(false);
    }
  };

  // SCREEN 1: Biletlar / Test to'plamini tanlash ekrani
  if (!selectedTestId) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Rasmiy YHQ Biletlari</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Imtihon Biletini Tanlang
          </h2>
          <p className="text-sm text-slate-400">
            O'zingiz xohlagan biletni tanlab, yo'l harakati qoidalari bo'yicha imtihon topshiring.
          </p>
        </div>

        {loadingTests ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-xs">Biletlar ro'yxati yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Random Practice Test Card */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 hover:border-emerald-400 transition shadow-xl flex flex-col justify-between space-y-5 bg-emerald-950/10 relative overflow-hidden group">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Umumiy Sinov
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                  Tasodifiy Namunaviy Test
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Barcha mavzular va belgilardan tasodifiy 10 ta savol tanlanadi. Tezkor tayyorgarlik uchun ajoyib sinov!
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Savollar:</span>
                    <span className="font-bold text-white">10 ta savol</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Vaqt:</span>
                    <span className="font-bold text-emerald-400">20 daqiqa</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectTest('random')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
              >
                <span>Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Individual Biletlar */}
            {availableTests.map((test) => (
              <div
                key={test.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition shadow-xl flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {test.category || 'Bilet'}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      Chegara: {test.pass_percentage}%
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-300 transition">
                    {test.title}
                  </h3>

                  {test.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Savollar:</span>
                      <span className="font-bold text-amber-400">{test.questions_count} ta</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Vaqt:</span>
                      <span className="font-bold text-white">{test.time_limit_minutes} daq</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTest(test.id)}
                  disabled={test.questions_count === 0}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition border border-slate-700 hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <span>{test.questions_count === 0 ? 'Savol yo\'q' : 'Ushbu Biletni Ishlash'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // SCREEN 2: Test topshirish zali (Taking the Exam)
  if (loadingQuestions) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Bilet savollari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl glass-panel text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Savollar mavjud emas</h3>
        <p className="text-sm text-slate-400">{error || 'Ushbu testda hali savollar mavjud emas.'}</p>
        <button
          onClick={handleBackToTests}
          className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm"
        >
          Boshqa biletni tanlash
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToTests}
            title="Biletni almashtirish"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Biletlar</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">
              {activeTestInfo?.title || 'Tasodifiy Umumiy Test'}
            </h2>
            <p className="text-xs text-slate-400">
              Javob berildi: <span className="text-emerald-400 font-bold">{answeredCount}</span> / {questions.length} ta
            </p>
          </div>
        </div>

        {/* Timer & Finish */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition ${
              timeLeft < 180
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-900 text-emerald-400 border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Yakunlash</span>
          </button>
        </div>
      </div>

      {/* Questions Numbers Grid */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`min-w-[36px] h-9 rounded-lg font-bold text-xs transition duration-150 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950'
                    : isAnswered
                    ? 'bg-teal-950 text-teal-300 border border-teal-600/50'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 font-semibold border border-slate-700">
            {currentQuestion.category || 'Yo\'l harakati qoidasi'}
          </span>
          <span className="text-slate-400 font-medium">
            Savol {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {currentQuestion.title}
        </h3>

        {/* Question Image (if present) */}
        {currentQuestion.image_url && (
          <div className="relative group max-w-md mx-auto">
            <div className="h-60 sm:h-72 w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
              <img
                src={getImageUrl(currentQuestion.image_url)}
                alt="Yo'l belgisi yoki vaziyat"
                className="max-h-full max-w-full object-contain cursor-zoom-in transition transform group-hover:scale-105 duration-200"
                onClick={() => setEnlargedImage(getImageUrl(currentQuestion.image_url))}
              />
            </div>
            <button
              onClick={() => setEnlargedImage(getImageUrl(currentQuestion.image_url))}
              className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 opacity-80 group-hover:opacity-100 transition"
              title="Kattalashtirish"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Options (2 to 5 options) */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options?.map((option, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isSelected = answers[currentQuestion.id] === option.id;

            return (
              <div
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`flex items-start space-x-3.5 p-4 rounded-xl cursor-pointer transition-all duration-150 border ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/10 text-white'
                    : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {letter}
                </div>
                <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                  {option.option_text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Oldingi</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 transition"
            >
              <Send className="w-4 h-4" />
              <span>Imtihonni topshirish</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-white">Imtihonni yakunlamoqchimisiz?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Siz jami {questions.length} ta savoldan {answeredCount} tasiga javob berdingiz.
                {answeredCount < questions.length && (
                  <span className="text-amber-400 font-semibold block mt-1">
                    Diqqat: {questions.length - answeredCount} ta savol belgilanmagan!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                Davom ettirish
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="py-2.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md shadow-emerald-500/20"
              >
                {submitting ? 'Yuborilmoqda...' : 'Topshirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-slate-800 text-white hover:bg-rose-500 transition shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={enlargedImage}
              alt="Kattalashtirilgan rasm"
              className="max-h-[75vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
