
import React, { useState } from 'react';
import { User, UserRank } from '../types';
import { locales } from '../locales';

interface NavbarProps {
  user: User | null;
  currentView: string;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, currentView, theme, language, isSidebarOpen, 
  onToggleSidebar, onToggleTheme, onToggleLanguage, onNavigate, onLogout, onLogin 
}) => {
  const isDark = theme === 'dark';
  const isAdmin = user?.rank === UserRank.ADMIN;
  
  const tNav = locales[language].nav;
  const tProfile = locales[language].profile;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navItems = [
    { label: tNav.problems, id: 'PROBLEM_LIST' },
    { label: tNav.learning, id: 'LEARNING' },
    { label: tNav.leaderboard, id: 'LEADERBOARD' },
  ];

  if (user?.rank && user.rank >= UserRank.TEACHER) {
    navItems.unshift({ label: tNav.classStats, id: 'TEACHER_DASHBOARD' });
  }

  // Chuyển hướng logo linh hoạt
  const handleLogoClick = () => {
    if (user) {
      onNavigate('DASHBOARD');
    } else {
      onNavigate('LANDING');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 h-20 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-12 border-b transition-all duration-500 ${isDark ? 'bg-black/60 border-white/5' : 'bg-white/60 border-gray-200'}`}>
      <div className="flex items-center gap-6 md:gap-8">
        {isAdmin && (
          <button 
            onClick={onToggleSidebar}
            className={`w-10 h-10 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-black hover:bg-black/10'}`}
          >
            <div className={`h-0.5 w-5 bg-current transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`h-0.5 w-5 bg-current transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></div>
            <div className={`h-0.5 w-5 bg-current transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        )}
        <div 
          className="text-2xl md:text-3xl font-black tracking-tighter cursor-pointer hover:scale-105 transition-transform" 
          onClick={handleLogoClick}
        >
          LQD
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-8 xl:gap-10 h-full">
        {user && navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`text-[11px] font-bold uppercase tracking-[0.2em] h-full transition-all relative px-1 whitespace-nowrap flex items-center ${
              currentView === item.id ? (isDark ? 'text-white' : 'text-black') : 'text-gray-400 hover:text-black'
             }`}
          >
            {item.label}
            {currentView === item.id && (
              <span className={`absolute bottom-0 left-0 right-0 h-[3px] ${isDark ? 'bg-white' : 'bg-black'}`} />
            )}
          </button>
        ))}

        {isAdmin && (
          <div className="flex items-center h-full pl-6 border-l border-gray-100 dark:border-white/5">
            <div className={`h-8 px-5 rounded-full inline-flex items-center justify-center transition-all shadow-lg ${isDark ? 'bg-white text-black' : 'bg-black text-white shadow-black/20'}`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap leading-none pt-[2px]">
                {tNav.adminControl}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onToggleLanguage}
          className={`px-3 md:px-4 h-9 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 text-white/50 hover:text-white' : 'bg-black/5 text-black/40 hover:text-black'}`}
        >
          {language === 'vi' ? 'VN' : 'EN'}
        </button>

        <button 
          onClick={onToggleTheme}
          className={`w-9 h-9 md:w-12 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl transition-all active:scale-90 group overflow-hidden ${isDark ? 'bg-white text-black hover:bg-slate-100' : 'bg-black text-white hover:bg-slate-800'}`}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-3 transition-all group p-1 md:pr-4 rounded-full ${isProfileOpen ? (isDark ? 'bg-white/10' : 'bg-black/5') : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${isDark ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <span className="text-sm">👤</span>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">{user.role}</p>
                <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>{user.username}</p>
              </div>
            </button>

            {isProfileOpen && (
              <div className={`absolute top-full right-0 mt-3 w-64 rounded-[2rem] shadow-2xl py-3 z-50 animate-fadeInScale border ${isDark ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-black'}`}>
                <button 
                  onClick={() => { onNavigate('ACCOUNT_SETTINGS'); setIsProfileOpen(false); }}
                  className={`w-full flex items-center gap-4 px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                  <span className="opacity-40 text-lg">⚙️</span>
                  {tProfile.settings}
                </button>
                <div className={`mx-6 h-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-100'} my-1`}></div>
                <button 
                  onClick={() => { onLogout(); setIsProfileOpen(false); }}
                  className={`w-full flex items-center gap-4 px-8 py-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                  <span className="opacity-40 text-lg">🚪</span>
                  {tProfile.logout}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className={`px-6 md:px-8 py-2.5 md:py-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
          >
            {tNav.signIn}
          </button>
        )}
      </div>
    </nav>
  );
};
