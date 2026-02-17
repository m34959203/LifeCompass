import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Close sidebar when a link is clicked (on mobile)
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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-3xl">explore</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LifeCompass</h2>
            </div>
            {/* Mobile Close Button */}
            <button 
                onClick={onClose}
                className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Главная</p>
            </Link>

            <Link
              to="/dashboard" // Pointing to dashboard for demo as tests list is there
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843] transition-colors"
            >
              <span className="material-symbols-outlined">description</span>
              <p className="text-sm font-medium">Тесты</p>
            </Link>

            <Link
              to="/results/1"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive('/results/1')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">bar_chart</span>
              <p className="text-sm font-medium">Результаты</p>
            </Link>

            <Link
              to="/history"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive('/profile')
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#283843]'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              <p className="text-sm font-medium">Профиль</p>
            </Link>
          </nav>
        </div>

        {/* User Profile Bottom */}
        <Link 
            to="/profile" 
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-[#283843] bg-slate-50 dark:bg-[#1d2830] p-3 hover:bg-slate-100 dark:hover:bg-[#25323b] transition-colors cursor-pointer"
        >
          <div 
            className="h-10 w-10 rounded-full bg-cover bg-center shrink-0" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAByvPGLLOK5ES4hQU_fjv5LKu4-GSjCOWrzkC_K0RNx6bzTvU-KMgGQAzZ_awsmqyJj92Fx7x146LjoTouBXUpicuz3Oe_PLL_eLTQAQ8fpAPP-REM8EQ5yoijXwXzf8e6S4GJeeDLVQWOlePxn8IIQaudDgvJIbGTMYCPLzoP1JJTZ0224z75Jf88ijOV3riVDGxutamT1aDBmIeL0orBs-VIdV9kb8o-pA7xXQQrh6PYdHDESyIoQpi0m2FFrGBtd1l10ciHFgY')" }}
          ></div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">Алексей</h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pro Аккаунт</p>
          </div>
        </Link>
      </aside>
    </>
  );
};