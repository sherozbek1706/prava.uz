import React from 'react';
import { ShieldCheck, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-10 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PRAVA<span className="text-emerald-400">.UZ</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              O'zbekiston Respublikasi Yo'l Harakati Qoidalari (YHQ) bo'yicha namunaviy va rasmiy test savollari platformasi. Haydovchilik imtihoniga to'liq tayyorgarlik ko'ring va natijalaringizni real vaqtda kuzating.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400/90 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Avtomaktab standartlariga to'liq moslashtirilgan</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Tezkor havolalar</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition">Bosh sahifa</Link>
              </li>
              <li>
                <Link to="/exam" className="hover:text-emerald-400 transition">Biletlar & Testlar</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-400 transition">Natijalar tarixi</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">Talaba kabineti</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PRAVA.UZ — Barcha huquqlar himoyalangan.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>O'zbekiston YHQ imtihon tizimi</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
