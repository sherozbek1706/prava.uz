import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  History,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>O'zbekiston YHQ Bo'yicha Onlayn Imtihon</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Prava olish uchun <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                mukammal tayyorgarlik!
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Yo'l harakati qoidalari (YHQ) testlarini ishlang, xatolaringiz ustida ishlang va haydovchilik guvohnomasini birinchi urinishda oling. Barcha natijalar profilingiz tarixida saqlanib boradi.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/exam"
                className="flex items-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition duration-200 text-base"
              >
                <BookOpen className="w-5 h-5" />
                <span>Testni Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl border border-slate-700 transition duration-200 text-base"
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Ro'yxatdan o'tish</span>
                </Link>
              ) : (
                <Link
                  to="/history"
                  className="flex items-center space-x-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold rounded-xl border border-slate-700 transition duration-200 text-base"
                >
                  <History className="w-5 h-5 text-teal-400" />
                  <span>Mening tarixim</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">90%</p>
                <p className="text-xs text-slate-400 mt-0.5">O'tish chegarasi</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">2-5 ta</p>
                <p className="text-xs text-slate-400 mt-0.5">Variantli savollar</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Tarixda saqlanish</p>
              </div>
            </div>
          </div>

          {/* Hero Graphic / Exam Mockup */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>19:42 qoldi</span>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white">Savol 1 / 10</span>
                  <span className="text-emerald-400">Imtiyoz belgilari</span>
                </div>

                <div className="h-44 rounded-xl bg-slate-950 flex items-center justify-center p-3 border border-slate-800">
                  <img
                    src="/uploads/stop_sign.svg"
                    alt="Stop belgisi"
                    className="max-h-full object-contain filter drop-shadow"
                  />
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  Ushbu yo'l belgisi nimani bildiradi?
                </p>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                    <span>A) To'xtash taqiqlanadi</span>
                    <span className="text-slate-500">1</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/50 text-xs text-emerald-300 flex items-center justify-between font-medium">
                    <span>B) To'xtamasdan harakatlanish taqiqlanadi</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tizimning asosiy afzalliklari
          </h2>
          <p className="text-sm text-slate-400">
            Avtomaktab va YHQ davlat imtihoni talablariga mos ravishda ishlab chiqilgan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2 dan 5 tagacha Variantlar</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Savollarda 2, 3, 4 yoki 5 ta javob varianti bo'ladi. Ulardan faqat bittasi to'g'ri bo'lib, haqiqiy imtihon sharoitini yaratadi.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">To'liq Natijalar Tarixi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Topshirgan har bir test avtomatik ravishda PostgreSQL ma'lumotlar bazasida saqlanadi. Xatolaringizni istalgan payt ko'rib chiqing.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">4 Talik Xavfsiz PIN</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O'zbekiston raqamlari (+998) va qulay 4 raqamli PIN orqali tezda kirish. Parolni eslab qolish oson va qulay.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action for Tests & Tickets */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Rasmiy YHQ Biletlari</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Biletlar bo'yicha imtihonga tayyorlaning
          </h3>
          <p className="text-sm text-slate-400 max-w-xl">
            Har bir biletda yo'l harakati qoidalari, ustunlik belgilari va chorraha tartiblari mavjud. O'zingizga qulay biletni tanlab, bilimingizni sinab ko'ring.
          </p>
        </div>

        <Link
          to="/exam"
          className="flex-shrink-0 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/25"
        >
          Biletlarni tanlash →
        </Link>
      </section>
    </div>
  );
}
