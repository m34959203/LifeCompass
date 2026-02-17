import React from 'react';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isChat = location.pathname.startsWith('/assessment');

  if (isLanding) {
    return <div className="h-screen w-full overflow-y-auto bg-white dark:bg-[#131b20]">{children}</div>;
  }

  return (
    <div className="relative flex h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <Sidebar />
      <main className={`flex-1 h-full overflow-hidden ${isChat ? 'flex flex-col' : 'overflow-y-auto scrollbar-hide'}`}>
        {children}
      </main>
    </div>
  );
};
