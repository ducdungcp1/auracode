
import React, { useEffect, useState } from 'react';
import { locales } from '../locales';

interface LandingViewProps {
  onStart: () => void;
  onGoToProblems: () => void;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onGoToProblems, theme, language }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isDark = theme === 'dark';
  const t = locales[language].landing;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center py-20">
      <div className={`relative z-10 text-center px-4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className={`inline-block px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] mb-8 border shadow-sm transition-colors duration-500 ${isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
          {t.badge}
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
          {t.hero1} <br/>
          <span className={`text-transparent bg-clip-text transition-all duration-1000 block mt-2 pb-4 ${isDark ? 'bg-gradient-to-r from-white via-white to-slate-600' : 'bg-gradient-to-r from-black via-black to-slate-400'}`}>
            {t.hero2}
          </span>
        </h1>
        
        <p className={`max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-medium mb-12 leading-relaxed transition-colors duration-1000 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {t.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button 
            onClick={onStart}
            className={`group relative px-12 py-4 font-black rounded-[2rem] hover:scale-105 transition-all active:scale-95 shadow-2xl overflow-hidden ${isDark ? 'bg-white text-black' : 'bg-black text-white shadow-black/20'}`}
          >
            <span className="relative z-10 text-[11px] uppercase tracking-[0.3em]">{t.start}</span>
            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${isDark ? 'bg-black/10' : 'bg-white/10'}`}></div>
          </button>
          
          <button 
            onClick={onGoToProblems}
            className={`px-12 py-4 border-2 font-black rounded-[2rem] transition-all active:scale-95 text-[11px] uppercase tracking-[0.3em] ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
          >
            {t.browse}
          </button>
        </div>

        {/* Stats moved inside the scrollable container and adjusted for scaling */}
        <div className={`flex flex-wrap gap-12 sm:gap-20 justify-center transition-all duration-1000 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">12.5K</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">{t.stats.devs}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">99.9%</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">{t.stats.uptime}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-black tracking-tighter">50ms</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">{t.stats.latency}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
