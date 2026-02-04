
import React from 'react';
import { locales } from '../locales';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'info';
  theme: 'light' | 'dark';
  language?: 'vi' | 'en';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = 'info', theme, language = 'vi' }) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';
  const tCancel = locales[language].common.cancel;

  return (
    // Fixed container covers the whole viewport, extremely high z-index to overlay everything
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
      {/* Absolute overlay that covers EVERYTHING with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-fadeInScale border ${isDark ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-black'}`}>
        <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">{title}</h3>
        <p className={`text-sm font-medium mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{message}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            {tCancel.toUpperCase()}
          </button>
          <button 
            onClick={() => { if(onConfirm) onConfirm(); onClose(); }}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg ${
              type === 'danger' 
                ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600' 
                : (isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800')
            }`}
          >
            {confirmText.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
