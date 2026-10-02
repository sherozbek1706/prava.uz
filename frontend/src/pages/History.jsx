import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  History as HistoryIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Eye,
  Award,
  BookOpen,
  ArrowRight,
  X,
  Info
} from 'lucide-react';

export default function History() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState({
    summary: { total_exams: 0, passed_exams: 0, failed_exams: 0, average_score: 0 },
    exams: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/exams/my-history');
        if (res.data.success) {
          setHistoryData(res.data);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, navigate]);

  const viewExamDetails = async (examId) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/exams/${examId}`);
      if (res.data.success) {
        setSelectedExamDetails(res.data.exam);
      }
    } catch (err) {
      alert('Imtihon tafsilotlarini yuklashda xatolik.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Natijalar tarixi yuklanmoqda...</p>
      </div>
    );
  }

  const { summary, exams } = historyData;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <HistoryIcon className="w-4 h-4" />
            <span>Shaxsiy Kabinet</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Mening Testlarim Tarixi
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Barcha topshirilgan sinov imtihonlari va xatolar ustida ishlash arxivi.
          </p>
        </div>

        <Link
          to="/exam"
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>Yangi test boshlash</span>
        </Link>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-slate-400">Jami testlar</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.total_exams} <span className="text-xs text-slate-500 font-normal">marta</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-emerald-400">Muvaffaqiyatli (O'tgan)</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {summary.passed_exams} <span className="text-xs text-slate-500 font-normal">marta</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-rose-400">O'ta olmagan</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
            {summary.failed_exams} <span className="text-xs text-slate-500 font-normal">marta</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <p className="text-xs font-medium text-teal-400">O'rtacha ko'rsatkich</p>
          <p className="text-2xl sm:text-3xl font-black text-teal-400 mt-1">
            {summary.average_score}%
          </p>
        </div>
      </div>

      {/* History Table or Empty State */}
      {exams.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Siz hali test topshirmagansiz</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Yo'l harakati qoidalari bo'yicha namunaviy testni boshlang va dastlabki natijangizni saqlang!
          </p>
          <Link
            to="/exam"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition"
          >
            <span>Test topshirish</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4"># / Sana</th>
                  <th className="px-6 py-4">To'g'ri / Jami</th>
                  <th className="px-6 py-4">Natija (Foiz)</th>
                  <th className="px-6 py-4">Sarflangan vaqt</th>
                  <th className="px-6 py-4">Holati</th>
                  <th className="px-6 py-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exams.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-slate-500 text-xs">#{exams.length - idx}</span>
                        <div>
                          <p className="text-white font-semibold text-xs leading-snug">
                            {item.test_title || 'Umumiy namunaviy test'}
                          </p>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-200">
                      <span className={item.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.correct_answers}
                      </span>{' '}
                      / {item.total_questions}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{item.score_percentage}%</span>
                    </td>

                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {Math.floor(item.time_spent_seconds / 60)} daq {item.time_spent_seconds % 60} son
                    </td>

                    <td className="px-6 py-4">
                      {item.passed ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>O'TDI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>YIQILDI</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewExamDetails(item.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tahlil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Modal for Reviewing a Past Exam */}
      {selectedExamDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-3xl w-full my-8 p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Test tafsilotlari (#{selectedExamDetails.id})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sana: {formatDate(selectedExamDetails.created_at)} • Ball: {selectedExamDetails.score_percentage}%
                </p>
              </div>
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              {selectedExamDetails.answers?.map((ans, idx) => (
                <div
                  key={ans.answer_id || idx}
                  className={`p-4 rounded-xl border ${
                    ans.is_correct
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : 'bg-rose-950/15 border-rose-500/30'
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white text-sm">
                      {idx + 1}. {ans.question_title}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ans.is_correct
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {ans.is_correct ? "To'g'ri" : "Xato"}
                    </span>
                  </div>

                  {ans.image_url && (
                    <div className="max-w-xs mx-auto p-2 bg-slate-950 rounded-lg">
                      <img src={ans.image_url} alt="Savol rasmi" className="max-h-32 object-contain mx-auto" />
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    {ans.options?.map((opt) => {
                      const isChosen = Number(opt.id) === Number(ans.selected_option_id);
                      const isCorrect = opt.is_correct;

                      let style = 'bg-slate-950/60 text-slate-400 border border-transparent';
                      if (isCorrect) style = 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40';
                      else if (isChosen && !isCorrect) style = 'bg-rose-500/20 text-rose-300 line-through border border-rose-500/40';

                      return (
                        <div key={opt.id} className={`p-2 rounded-lg flex items-center justify-between ${style}`}>
                          <span>{opt.option_text}</span>
                          {isCorrect && <span className="text-[10px] font-bold">To'g'ri javob</span>}
                          {isChosen && !isCorrect && <span className="text-[10px] font-bold">Sizning javobingiz</span>}
                        </div>
                      );
                    })}
                  </div>

                  {ans.question_description && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-lg">
                      <span className="font-semibold text-slate-300">Izoh: </span>{ans.question_description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl"
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
