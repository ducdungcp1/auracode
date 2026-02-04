
import React, { useState } from 'react';
import { locales } from '../locales';

interface AuthViewProps {
  onLogin: (user: string, pass: string) => void;
  onGoToRegister: () => void;
  onBack: () => void;
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
  loginError?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onGoToRegister, onBack, language, theme, loginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const t = locales[language].auth;
  const tc = locales[language].common;

  return (
    <div className={`flex min-h-screen transition-colors duration-1000 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className={`hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden border-r ${isDark ? 'bg-white/5 border-white/5' : 'bg-black border-gray-100'}`}>
        <div className={`absolute inset-0 grid-bg ${isDark ? 'opacity-5' : 'opacity-10'}`} />
        <div className="relative z-10 p-20">
          <h2 className={`text-7xl font-extrabold tracking-tighter mb-8 leading-[0.85] text-white uppercase`}>
            {t.heroTitle} <br/>
            <span className="text-sky-500">{t.heroSubtitle}</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-sm">
            Access the elite algorithmic judging environment. Authentication required.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-24 justify-center relative">
        <button onClick={onBack} className={`absolute top-12 left-12 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 opacity-40 hover:opacity-100`}>
          ← {tc.return}
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t.welcome}</h1>
            <p className="text-gray-400 font-medium">{t.description}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }} className="space-y-8">
            <div className="relative">
              <label className={`absolute left-0 -top-6 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isFocused === 'username' || username ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {t.username}
              </label>
              <input 
                type="text"
                placeholder={isFocused === 'username' ? '' : t.username}
                className={`w-full py-4 bg-transparent border-b-2 outline-none transition-all font-bold ${isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'}`}
                onFocus={() => setIsFocused('username')}
                onBlur={() => setIsFocused(null)}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className={`absolute left-0 -top-6 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isFocused === 'password' || password ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {t.password}
              </label>
              <input 
                type="password"
                placeholder={isFocused === 'password' ? '' : t.password}
                className={`w-full py-4 bg-transparent border-b-2 outline-none transition-all font-bold ${isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'}`}
                onFocus={() => setIsFocused('password')}
                onBlur={() => setIsFocused(null)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {loginError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{loginError}</p>}

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className={`w-4 h-4 rounded border-gray-300 text-black focus:ring-black ${isDark ? 'bg-white/5 border-white/10' : ''}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/40 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}>{t.remember}</span>
              </label>
              <a href="#" className={`text-[10px] font-black uppercase tracking-widest hover:underline ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400'}`}>{t.forgot}</a>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                type="submit"
                className={`w-full py-5 font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-[10px] uppercase tracking-[0.2em] ${isDark ? 'bg-white text-black shadow-white/5' : 'bg-black text-white shadow-black/10'}`}
              >
                {t.signIn}
              </button>
              
              <div className="text-center pt-6">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  {t.noAccount} 
                  <button type="button" onClick={onGoToRegister} className="ml-2 text-sky-500 hover:underline">
                    {t.create}
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
