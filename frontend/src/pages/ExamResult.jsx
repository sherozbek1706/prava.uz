import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  History,
  AlertTriangle,
  ChevronDown,
  Info
} from 'lucide-react';

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.examResult;

  useEffect(() => {
    if (exam && exam.passed) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [exam]);

  if (!exam) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Natija topilmadi</h3>
        <p className="text-sm text-slate-400">
          Iltimos, avval test topshiring yoki natijalar tarixiga o'ting.
        </p>
        <Link
          to="/exam"
          className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm"
        >
          Testga o'tish
        </Link>
      </div>
    );
  }

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} daqiqa ${s} soniya`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Result Status Header */}
      <div
        className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden text-center space-y-4 ${
          exam.passed
            ? 'bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-500/10'
            : 'bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-500/10'
        }`}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 shadow-xl mx-auto ${
          exam.passed
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
            : 'bg-rose-500/20 border-rose-400 text-rose-400'
        }">
          {exam.passed ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          ) : (
            <XCircle className="w-10 h-10 text-rose-400" />
          )}
        </div>

        <div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              exam.passed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {exam.passed ? "O'TDI — MUVAFFAQIYATLI" : "O'TA OLMADI"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            {exam.passed ? 'Tabriklaymiz!' : 'Afsuski, yetarli emas'}
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mt-1">
            {exam.passed
              ? "Siz davlat YHQ talablariga muvofiq imtihondan muvaffaqiyatli o'tdingiz!"
              : "Imtihondan o'tish uchun kamida 90% to'g'ri javob talab etiladi. Xatolaringizni o'rganib qaytadan urinib ko'ring."}
          </p>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400">To'g'ri javoblar</p>
            <p className="text-2xl font-black text-white mt-1">
              <span className={exam.passed ? 'text-emerald-400' : 'text-rose-400'}>
                {exam.correct_answers}
              </span>{' '}
              <span className="text-slate-500 text-base font-normal">/ {exam.total_questions}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400">Natija (Foiz)</p>
            <p className="text-2xl font-black text-white mt-1">
              {exam.score_percentage}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400">Sarflangan vaqt</p>
            <p className="text-sm sm:text-base font-bold text-white mt-2">
              {formatSeconds(exam.time_spent_seconds || 0)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400">Tarixga saqlandi</p>
            <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center justify-center space-x-1">
              <span>Ha, bazada</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/exam"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qaytadan test topshirish</span>
          </Link>

          <Link
            to="/history"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Natijalar tarixi</span>
          </Link>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Savollar tahlili va javoblar</h3>
          <span className="text-xs text-slate-400">
            Jami {exam.results?.length || 0} ta savol
          </span>
        </div>

        <div className="space-y-4">
          {exam.results?.map((res, index) => {
            return (
              <div
                key={res.question_id || index}
                className={`p-6 rounded-2xl border glass-panel space-y-4 ${
                  res.is_correct
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        res.is_correct
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-snug">
                        {res.question_title}
                      </h4>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      res.is_correct
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {res.is_correct ? "To'g'ri" : "Noto'g'ri"}
                  </span>
                </div>

                {/* Question Image if present */}
                {res.image_url && (
                  <div className="max-w-xs mx-auto p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img
                      src={res.image_url}
                      alt="Savol tasviri"
                      className="max-h-40 object-contain"
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {res.options?.map((opt, optIdx) => {
                    const isStudentChoice = Number(opt.id) === Number(res.selected_option_id);
                    const isRightOption = opt.is_correct;

                    let rowStyle = 'bg-slate-900/60 border-slate-800 text-slate-300';
                    if (isRightOption) {
                      rowStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                    } else if (isStudentChoice && !isRightOption) {
                      rowStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300 line-through';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl text-xs sm:text-sm border flex items-center justify-between ${rowStyle}`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold opacity-70">
                            {String.fromCharCode(65 + optIdx)})
                          </span>
                          <span>{opt.option_text}</span>
                        </div>

                        {isRightOption && (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-500/40">
                            To'g'ri javob
                          </span>
                        )}
                        {isStudentChoice && !isRightOption && (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/30 text-rose-200 font-bold border border-rose-500/40">
                            Sizning javobingiz
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Question Description / Rule Explanation */}
                {res.question_description && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-400 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300">Qoida izohi: </span>
                      <span>{res.question_description}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
