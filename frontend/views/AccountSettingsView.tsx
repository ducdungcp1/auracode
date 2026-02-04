
import React, { useState } from 'react';
import { User } from '../types';
import { locales } from '../locales';

interface AccountSettingsViewProps {
  user: User;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  onSave: (u: Partial<User>) => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({ user, theme, language, onSave }) => {
  const isDark = theme === 'dark';
  const t = locales[language].settings;

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    studentId: user.studentId,
    dob: user.dob,
    currentPassword: '',
    newPassword: '',
  });

  const inputClass = `w-full px-8 py-4 rounded-2xl border-2 outline-none transition-all font-bold text-sm ${
    isDark ? 'bg-white/5 border-white/5 focus:border-white' : 'bg-white border-gray-100 focus:border-black shadow-sm'
  }`;

  return (
    <div className="pb-24 animate-fadeIn">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-current"></div>
          <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-40">{t.personalInfo}</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter">{t.title}.</h1>
        <p className="text-gray-400 font-medium mt-2 text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-16">
          {/* General Information Section */}
          <section className="space-y-10">
            <h2 className="text-3xl font-black tracking-tight border-b border-gray-100 dark:border-white/5 pb-6">{t.personalInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.name}</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.studentId}</label>
                <input 
                  type="text" 
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.email}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.phone}</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className={inputClass}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.dob}</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-10">
            <h2 className="text-3xl font-black tracking-tight border-b border-gray-100 dark:border-white/5 pb-6">{t.security}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.currentPassword}</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className={inputClass}
                  value={formData.currentPassword}
                  onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block opacity-50">{t.newPassword}</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className={inputClass}
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
            <button className={`px-12 py-5 font-black rounded-[2rem] text-[11px] uppercase tracking-[0.2em] border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
              {t.discard}
            </button>
            <button 
              onClick={() => onSave(formData)}
              className={`px-14 py-5 font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl ${isDark ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/20 hover:scale-105 active:scale-95'}`}
            >
              {t.save}
            </button>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className={`p-10 rounded-[3rem] border transition-all duration-500 ${isDark ? 'bg-[#181818] border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-xl'}`}>
            <div className="flex flex-col items-center text-center mb-10">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl border-8 mb-6 transition-transform hover:rotate-6 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-white shadow-inner'}`}>
                👤
              </div>
              <h3 className="text-2xl font-black tracking-tighter">{user.fullName}</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">{user.username}</p>
            </div>
            
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Role</span>
                <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>{user.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Problems Solved</span>
                <span className="text-[12px] font-black">{user.stats.problemsSolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Global Rank</span>
                <span className="text-[12px] font-black">#{user.stats.rank}</span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2rem] border border-sky-500/20 bg-sky-500/5 transition-all hover:bg-sky-500/10`}>
             <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-2">Protocol Note</p>
             <p className="text-[11px] text-sky-500/80 font-medium leading-relaxed">System privileges are mapped to your Student ID. Ensure all credentials are valid for competitive indexing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
