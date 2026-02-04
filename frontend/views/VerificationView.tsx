
import React, { useState, useEffect, useRef } from 'react';
import { locales } from '../locales';

interface VerificationViewProps {
  email: string;
  phone?: string;
  onVerified: () => void;
  onBack: () => void;
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}

export const VerificationView: React.FC<VerificationViewProps> = ({ email, phone, onVerified, onBack, language, theme }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isSending, setIsSending] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const isDark = theme === 'dark';
  const t = locales[language].verify;
  const tc = locales[language].common;

  // Xác định kênh nhận mã (Ưu tiên SĐT theo yêu cầu)
  const contactChannel = phone || email || "...";
  const isSms = !!phone;

  const generateAndSendOtp = () => {
    setIsSending(true);
    setShowNotification(false);
    
    // Tạo mã 8 số ngẫu nhiên
    const newOtp = Math.floor(10000000 + Math.random() * 90000000).toString();
    setGeneratedOtp(newOtp);

    // Giả lập độ trễ truyền tải mạng thực tế
    setTimeout(() => {
      setIsSending(false);
      setShowNotification(true);
      
      // Auto-hide notification after 12 seconds
      setTimeout(() => setShowNotification(false), 12000);
      
      console.log(`[CODE JUDGE LQD] SMS DISPATCHED TO ${contactChannel}: Mã xác thực của bạn là ${newOtp}`);
    }, 2800);
  };

  useEffect(() => {
    generateAndSendOtp();
  }, [contactChannel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === generatedOtp) {
      onVerified();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleResend = () => {
    setCode('');
    generateAndSendOtp();
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-1000 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Real-world Mobile Style Notification */}
      <div className={`fixed top-6 right-6 z-[200] w-[320px] transition-all duration-700 transform ease-out ${showNotification ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95 pointer-events-none'}`}>
        <div className={`p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border backdrop-blur-3xl ${isDark ? 'bg-zinc-900/90 border-white/10 text-white' : 'bg-white/95 border-black/5 text-black'}`}>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/30 flex items-center justify-center text-[10px] font-black text-white">LQD</div>
             <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Code Judge LQD</p>
                <p className="text-[9px] opacity-40 uppercase font-bold">Now • via SMS</p>
             </div>
             <button onClick={() => setShowNotification(false)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">✕</button>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <p className="text-sm font-bold leading-relaxed">
              {language === 'vi' ? 'Mã xác thực của bạn là' : 'Your verification code is'} <span className="text-sky-400 font-black tracking-wider">{generatedOtp}</span>.
            </p>
          </div>
        </div>
      </div>

      <div className={`hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden border-r ${isDark ? 'bg-white/5 border-white/5' : 'bg-black border-gray-100'}`}>
        <div className={`absolute inset-0 grid-bg ${isDark ? 'opacity-5' : 'opacity-10'}`} />
        <div className="relative z-10 p-20 text-center">
          <div className="w-32 h-32 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-10 border border-sky-500/30 relative">
             {isSending && <div className="absolute inset-[-8px] border-[4px] border-sky-500 border-t-transparent rounded-full animate-spin"></div>}
            <span className="text-5xl">{isSms ? '📱' : '📧'}</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter mb-4 text-white uppercase">SECURITY</h2>
          <p className="text-gray-400 text-lg font-medium">Algorithmic Integrity Protocol v1.0</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-24 justify-center relative">
        <button 
          onClick={onBack}
          className={`absolute top-12 left-12 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-black'}`}
        >
          ← {tc.return}
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-4 uppercase">{t.title}</h1>
            
            <div className={`p-7 rounded-[2rem] border-2 transition-all duration-700 ${isSending ? 'opacity-50 blur-[2px]' : 'opacity-100 blur-0'} ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                 {isSms ? t.sentPhone : t.sentEmail}
               </p>
               <p className={`font-black text-xl tracking-tight truncate ${isDark ? 'text-white' : 'text-black'}`}>
                 {contactChannel}
               </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="relative">
              <label className="absolute left-0 -top-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {isSending ? t.sending : t.code}
              </label>
              <input 
                type="text"
                maxLength={8}
                placeholder="••••••••"
                autoFocus
                disabled={isSending}
                className={`w-full py-6 bg-transparent border-b-4 outline-none transition-all font-black text-5xl tracking-[0.4em] text-center ${
                  isSending ? 'opacity-20 select-none' : 
                  (error ? 'border-rose-500 text-rose-500 animate-pulse' : (isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'))
                }`}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              {error && <p className="text-[10px] font-black text-rose-500 uppercase mt-4 tracking-widest text-center">{t.error}</p>}
            </div>

            <div className="space-y-6">
              <button 
                type="submit"
                disabled={isSending || code.length < 8}
                className={`w-full py-6 font-black rounded-3xl transition-all shadow-xl text-[11px] uppercase tracking-[0.3em] ${
                  isSending ? 'bg-gray-400 cursor-not-allowed opacity-20' : 
                  (isDark ? 'bg-white text-black shadow-white/5 hover:scale-[1.02]' : 'bg-black text-white shadow-black/10 hover:scale-[1.02]')
                }`}
              >
                {t.submit}
              </button>
              
              <button 
                type="button"
                onClick={handleResend}
                disabled={isSending}
                className={`w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-sky-500 transition-colors disabled:opacity-0`}
              >
                {t.resend}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
