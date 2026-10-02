import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, KeyRound, LogIn, AlertCircle, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('+998 ');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/exam';

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith('+998')) {
      input = '+998 ' + input.replace(/\D/g, '');
    }
    let digits = input.slice(4).replace(/\D/g, '');
    if (digits.length > 9) digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 2);
    if (digits.length >= 2) formatted += ') ' + digits.slice(2, 5);
    if (digits.length >= 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length >= 7) formatted += ' ' + digits.slice(7, 9);

    setPhone(formatted);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 12) {
      setError('Iltimos, telefon raqamingizni to\'liq kiriting (+998 XX XXX XX XX).');
      return;
    }

    if (pin.length !== 4) {
      setError('Parol aynan 4 ta raqam bo\'lishi kerak.');
      return;
    }

    setLoading(true);
    try {
      const res = await login('+' + digitsOnly, pin);
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Telefon raqam yoki parol xato.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (testPhone, testPin) => {
    setPhone(testPhone);
    setPin(testPin);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-inner">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tizimga kirish
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Telefon raqamingiz va 4 xonali PIN parolingizni kiriting.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Telefon raqam */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Telefon raqami
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
          </div>

          {/* 4 talik parol */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                4 talik PIN Parol
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
                placeholder="••••"
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
              <span>Kirilmoqda...</span>
            ) : (
              <>
                <span>Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick test credentials box */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1.5">Tezkor sinov uchun namunaviy profil:</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-emerald-400">+998 90 111 22 33 (PIN: 1234)</span>
            <button
              type="button"
              onClick={() => handleQuickFill('+998 (90) 111 22 33', '1234')}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              Tanlash
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
          <span>Hisobingiz yo'qmi?</span>
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Ro'yxatdan o'tish →
          </Link>
        </div>
      </div>
    </div>
  );
}
