
import React from 'react';

interface LoadingOverlayProps {
  theme: 'light' | 'dark';
  isExiting?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ theme, isExiting = false }) => {
  const isDark = theme === 'dark';
  
  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        isExiting 
          ? 'opacity-0 backdrop-blur-none pointer-events-none' 
          : 'opacity-100 backdrop-blur-md'
      } ${isDark ? 'bg-black/60' : 'bg-white/60'}`}
    >
      <div className={`relative w-20 h-20 transition-transform duration-500 ${isExiting ? 'scale-150' : 'scale-100'}`}>
        <div className={`absolute inset-0 border-[3px] rounded-full ${isDark ? 'border-white/10' : 'border-black/5'}`}></div>
        <div className={`absolute inset-0 border-[3px] border-t-transparent rounded-full animate-spin ${isDark ? 'border-white' : 'border-black'}`}></div>
      </div>
      <p className={`mt-8 text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-500 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-40 animate-pulse'
      } ${isDark ? 'text-white' : 'text-black'}`}>
        Synchronizing...
      </p>
    </div>
  );
};
