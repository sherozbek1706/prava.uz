import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  FileQuestion,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Car,
  Bell,
  Sparkles
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Boshqaruv Paneli',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Testlar & Biletlar',
      path: '/admin/tests',
      icon: Layers,
      badge: 'Biletlar',
    },
    {
      name: 'Savollar Bazasi',
      path: '/admin/questions',
      icon: FileQuestion,
      badge: null,
    },
    {
      name: 'Studentlar Ro\'yxati',
      path: '/admin/students',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex overflow-x-hidden font-sans">
      {/* Collapsible Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0d1322] border-r border-slate-800/90 transition-all duration-300 flex flex-col shadow-2xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          {!collapsed ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="leading-tight truncate">
                <span className="font-black text-base text-white tracking-wide">
                  PRAVA<span className="text-amber-400"> ADMIN</span>
                </span>
                <span className="block text-[10px] text-amber-400/80 uppercase font-semibold tracking-wider">
                  Boshqaruv Tizimi
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Toggle button on desktop */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Saydbarni kengaytirish' : 'Saydbarni yopish'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Asosiy Menyu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : ''}
                className={`flex items-center rounded-xl transition-all duration-150 ${
                  collapsed ? 'justify-center p-3' : 'px-3.5 py-3 space-x-3'
                } ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <span className="text-sm truncate flex-1">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer with Admin Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1b]">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-amber-500/30">
                  A
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-amber-400 font-mono">Bosh administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Chiqish"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="w-full flex items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition border border-slate-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Admin Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#090e1a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white sm:hidden"
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-bold text-amber-400">ADMIN</span>
              <span>/</span>
              <span className="text-slate-200 capitalize">
                {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Himoyalangan Admin Seans</span>
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-semibold border border-rose-900/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
