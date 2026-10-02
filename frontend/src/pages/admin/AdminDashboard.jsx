import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  HelpCircle,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Shield,
  FileQuestion
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    stats: {
      total_questions: 0,
      total_students: 0,
      total_tests: 0,
      total_exams: 0,
      passed_exams: 0,
      failed_exams: 0,
      average_score: 0,
      pass_rate: 0,
    },
    recent_exams: [],
    category_stats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, isAdmin, navigate]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Admin ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  const { stats, recent_exams, category_stats } = data;

  return (
    <div className="space-y-8">
      {/* Header & Quick Nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Avtomaktab Boshqaruvi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Savollar bazasi, biletlar, talabalar statistikasi va test natijalarini to'liq nazorat qiling.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/admin/tests"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Biletlar ({stats.total_tests || 0})</span>
          </Link>
          <Link
            to="/admin/questions"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Savol qo'shish (Multer)</span>
          </Link>
        </div>
      </div>

      {/* Primary Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. SAVOLLAR SONI */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-amber-400">
            <FileQuestion className="w-24 h-24 -mt-4 -mr-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
              Savollar Soni
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black text-white">{stats.total_questions}</p>
            <p className="text-xs text-slate-400 mt-1">Bazada mavjud umumiy savollar</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              to="/admin/questions"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Savollar bazasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-slate-500">Rasmli & 2-5 variant</span>
          </div>
        </div>

        {/* 2. STUDENTLAR SONI */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-emerald-400">
            <Users className="w-24 h-24 -mt-4 -mr-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90">
              Studentlar Soni
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black text-white">{stats.total_students}</p>
            <p className="text-xs text-slate-400 mt-1">Ro'yxatdan o'tgan talabalar</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Ro'yxatni ochish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-slate-500">+998 raqamlar</span>
          </div>
        </div>

        {/* 3. TESTLAR & BILETLAR SONI */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-500/60 transition shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-cyan-400">
            <Layers className="w-24 h-24 -mt-4 -mr-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/90">
              Biletlar To'plami
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black text-white">{stats.total_tests || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Aktiv biletlar va test guruhlari</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              to="/admin/tests"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Biletlarni sozlash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-slate-500">Unikal savolli</span>
          </div>
        </div>

        {/* 4. O'RTASHA NATIJA & PASS RATE */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              O'tish Ko'rsatkichi
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center border border-slate-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-black text-white">{stats.pass_rate}%</p>
            <p className="text-xs text-slate-400 mt-1">
              Jami topshirilgan: {stats.total_exams} marta
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">{stats.passed_exams} ta o'tdi</span>
            <span className="text-rose-400 font-semibold">{stats.failed_exams} ta yiqildi</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Exams + Categories breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Exams (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">So'nggi Topshirilgan Imtihonlar</h3>
              <p className="text-xs text-slate-400">Talabalar tomonidan topshirilgan oxirgi natijalar</p>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Barcha talabalar →
            </Link>
          </div>

          {recent_exams.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Hali testlar topshirilmagan.</p>
          ) : (
            <div className="space-y-3">
              {recent_exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        exam.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {exam.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{exam.student_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{exam.student_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <div>
                      <span className="text-slate-400">Ball: </span>
                      <span className="font-bold text-white">{exam.score_percentage}%</span>
                      <span className="text-slate-500 ml-1">
                        ({exam.correct_answers}/{exam.total_questions})
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {formatDate(exam.created_at)}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        exam.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {exam.passed ? "O'TDI" : "YIQILDI"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Breakdown (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center space-x-2 text-slate-200">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Savollar Kategoriyalari</h3>
          </div>
          <p className="text-xs text-slate-400">Yo'nalishlar bo'yicha taqsimot</p>

          <div className="space-y-3 pt-1">
            {category_stats.map((cat, idx) => {
              const percentage = stats.total_questions > 0
                ? Math.round((Number(cat.count) / stats.total_questions) * 100)
                : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.category || 'Umumiy'}</span>
                    <span className="font-bold text-white">{cat.count} ta ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              to="/admin/tests"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition"
            >
              <span>Biletlarni sozlash</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/questions"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
            >
              <span>Barcha savollar bazasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
