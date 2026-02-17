import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const isAssessment = location.pathname.startsWith('/assessment');

  if (isLanding) {
    return <div className="h-screen w-full overflow-y-auto bg-white dark:bg-[#131b20]">{children}</div>;
  }

  return (
    <div className="relative flex h-screen w-full flex-col md:flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* Mobile Header: Visible only on mobile and not on assessment pages */}
      {!isAssessment && (
          <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-[#131b20] border-b border-slate-200 dark:border-[#283843] shrink-0 z-30">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">LifeCompass Uni</span>
            </div>
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#283843] rounded-lg transition-colors"
                aria-label="Открыть меню"
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={`flex-1 h-full overflow-hidden relative w-full ${isAssessment ? 'flex flex-col' : 'overflow-y-auto scrollbar-hide'}`}>
        {children}
      </main>
    </div>
  );
};