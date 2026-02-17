import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFILE_KEY = 'lifecompass_profile';

const loadProfile = (): { name: string; email: string } => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { name: parsed.name || '', email: parsed.email || '' };
    }
  } catch {}
  return { name: '', email: '' };
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const profile = loadProfile();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex h-full w-72 md:w-64 min-w-[256px] flex-col justify-between
        border-r border-slate-200 dark:border-[#283843] bg-white dark:bg-[#131b20] p-4
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-between px-2">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LifeCompass Uni</h2>
            </Link>
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive('/dashboard')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Главная</p>
            </Link>

            <Link
              to="/history"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive('/history')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">history</span>
              <p className="text-sm font-medium">История</p>
            </Link>

            <Link
              to="/profile"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive('/profile')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              <p className="text-sm font-medium">Профиль</p>
            </Link>
          </nav>

          {/* Divider */}
          <div className="px-3">
            <div className="border-t border-slate-200 dark:border-[#283843]"></div>
          </div>

          {/* Quick Start */}
          <div className="px-2">
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">add</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Новый тест</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Выбрать методику</p>
              </div>
            </Link>
          </div>
        </div>

        {/* User Profile Bottom */}
        <Link
            to="/profile"
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-[#283843] bg-slate-50 dark:bg-[#1d2830] p-3 hover:bg-slate-100 dark:hover:bg-[#25323b] transition-colors cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'П'}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {profile.name || 'Пользователь'}
            </h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {profile.email || 'Настроить профиль'}
            </p>
          </div>
        </Link>
      </aside>
    </>
  );
};
