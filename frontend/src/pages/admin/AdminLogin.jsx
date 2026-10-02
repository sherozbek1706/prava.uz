import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Phone, KeyRound, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('+998 ');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 12) {
      setError('Administrator telefon raqamini to\'liq kiriting (+998 XX XXX XX XX).');
      return;
    }

    if (!pin) {
      setError('Administrator parolini kiriting.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin('+' + digitsOnly, pin);
      if (res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Sizda administrator huquqlari mavjud emas.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Admin telefon raqam yoki parol xato.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setPhone('+998 (90) 123 45 67');
    setPin('7777');
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-amber-500/20 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Alohida Ma'muriyat Marshruti
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Admin Dashboard Kirish
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Avtomaktab boshqaruv tizimi va savollar monitoringi
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin Telefon Raqami
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4 text-amber-400/80" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 (90) 123 45 67"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin PIN Paroli (4 talik)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-amber-400/80" />
              </div>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Admin PIN"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 disabled:opacity-50 transition duration-200 text-sm mt-6"
          >
            {loading ? (
              <span>Kirilmoqda...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Admin Panelga Kirish</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Admin fill button */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300/90">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-300">Dastlabki Admin ma'lumotlari:</p>
              <p className="font-mono text-slate-300 mt-0.5">+998 90 123 45 67 (PIN: 7777)</p>
            </div>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition"
            >
              To'ldirish
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
