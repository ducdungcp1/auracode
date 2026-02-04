
import React from 'react';

interface SkyBackgroundProps {
  theme: 'light' | 'dark';
}

export const SkyBackground: React.FC<SkyBackgroundProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 pointer-events-none z-[-1] transition-colors duration-1000 ease-in-out ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Sun - Visible in Light Mode */}
      <div className={`absolute top-20 right-20 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) transform ${isDark ? 'translate-y-20 opacity-0 scale-50 rotate-90' : 'translate-y-0 opacity-100 scale-100 rotate-0'}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full shadow-[0_0_80px_rgba(251,191,36,0.2)] border border-amber-100"></div>
      </div>
      
      {/* Moon - Visible in Dark Mode */}
      <div className={`absolute top-20 right-20 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) transform ${isDark ? 'translate-y-0 opacity-100 scale-100 rotate-0' : '-translate-y-20 opacity-0 scale-50 -rotate-90'}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-3 right-3 w-4 h-4 bg-slate-500/10 rounded-full shadow-inner"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-slate-500/10 rounded-full shadow-inner"></div>
        </div>
      </div>

      {/* Grid Pattern - Minimalist approach */}
      <div className={`absolute inset-0 grid-bg transition-opacity duration-1000 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.05]'}`} />
    </div>
  );
};
