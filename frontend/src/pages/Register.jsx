import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format Uzbekistan phone number as user types: +998 (XX) XXX-XX-XX
  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith('+998')) {
      input = '+998 ' + input.replace(/\D/g, '');
    }
    // Extract digits only after +998
    let digits = input.slice(4).replace(/\D/g, '');
    if (digits.length > 9) digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ') ' + digits.slice(2, 5);
    if (digits.length >= 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length >= 7) formatted += ' ' + digits.slice(7, 9);

    setPhone(formatted);
  };

  // Only allow up to 4 digits for PIN
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Iltimos, ism va familiyangizni kiriting.');
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 12) {
      setError('O\'zbekiston telefon raqamini to\'liq kiriting (+998 XX XXX XX XX).');
      return;
    }

    if (pin.length !== 4) {
      setError('Parol aynan 4 ta raqamdan iborat bo\'lishi shart (masalan: 1234).');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), '+' + digitsOnly, pin);
      navigate('/exam');
    } catch (err) {
      setError(err?.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Decorative blur element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Talaba ro'yxatdan o'tishi
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Avtomaktab imtihon tizimiga xush kelibsiz! Ma'lumotlaringizni to'ldiring.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Ism-familiya */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ism va Familiya
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jasur Rahimov"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          {/* Telefon raqam */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Telefon raqami (O'zbekiston)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="text-base mr-1.5">🇺🇿</span>
                <Phone className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 (90) 123 45 67"
                className="w-full pl-16 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Ushbu raqam orqali keyinchalik tizimga kirasiz.
            </p>
          </div>

          {/* 4 talik parol (faqat raqam) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Parol (Aynan 4 ta raqam)
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">
                {pin.length} / 4 raqam
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                value={pin}
                onChange={handlePinChange}
                placeholder="Masalan: 1234"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono tracking-widest text-center text-lg placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Visual PIN dots indicator */}
            <div className="flex justify-center space-x-3 mt-2.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                    pin.length > idx
                      ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 text-sm mt-6"
          >
            {loading ? (
              <span>Ro'yxatdan o'tkazilmoqda...</span>
            ) : (
              <>
                <span>Ro'yxatdan o'tish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-sm text-slate-400">
            Hisobingiz allaqachon bormi?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1">
              Tizimga kiring
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
