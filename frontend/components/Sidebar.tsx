
import React from 'react';
import { locales } from '../locales';

interface SidebarProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  currentView: string;
  onNavigate: (v: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, theme, language, currentView, onNavigate }) => {
  const isDark = theme === 'dark';
  const t = locales[language].sidebar;
  
  const menuItems = [
    { id: 'DASHBOARD', label: t.overview },
    { id: 'TEACHER_DASHBOARD', label: t.analytics },
    { id: 'PROBLEM_LIST', label: t.repository },
    { id: 'SETTINGS', label: t.systems },
    { id: 'LEARNING', label: t.academy },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 pt-24 border-r transition-all duration-500 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white/40 border-gray-100 backdrop-blur-xl'}`}>
      <div className="px-10 mb-12">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">{t.admin}</p>
        <h3 className="text-xl font-black tracking-tighter">{t.console}</h3>
      </div>
      
      <nav className="px-6 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
              currentView === item.id 
                ? (isDark ? 'bg-white text-black shadow-2xl shadow-white/10' : 'bg-black text-white shadow-2xl shadow-black/10')
                : (isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-black hover:bg-black/5')
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-10 left-0 right-0 px-10">
        <div className={`p-6 rounded-[2rem] border transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.loadFactor}</p>
            <span className="text-[8px] font-black uppercase">{t.active}</span>
          </div>
          <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[15%] transition-all duration-1000"></div>
          </div>
          <p className="text-[9px] font-black mt-3 opacity-40">1.2 GB / 8.0 GB</p>
        </div>
      </div>
    </aside>
  );
};
