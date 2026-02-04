
import React, { useState } from 'react';
import { locales } from '../locales';

interface RegisterViewProps {
  onRegister: (data: any) => void;
  onGoToLogin: () => void;
  onBack: () => void;
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onGoToLogin, onBack, language, theme }) => {
  const [formData, setFormData] = useState({
    username: '',
    surname: '',
    givenName: '',
    email: '',
    phone: '',
    id: '', // Tùy chọn
    dob: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const t = locales[language].register;
  const tc = locales[language].common;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Tên đăng nhập bắt buộc
    if (!formData.username.trim()) {
      newErrors.username = t.errors.usernameRequired;
    }

    // Tên người dùng hợp lệ
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
    if (!formData.surname) {
      newErrors.surname = t.errors.required;
    } else if (!nameRegex.test(formData.surname.trim())) {
      newErrors.surname = language === 'vi' ? 'Họ không hợp lệ.' : 'Invalid surname.';
    }

    if (!formData.givenName) {
      newErrors.givenName = t.errors.required;
    } else if (!nameRegex.test(formData.givenName.trim())) {
      newErrors.givenName = language === 'vi' ? 'Tên không hợp lệ.' : 'Invalid name.';
    }

    // Ngày sinh bắt buộc
    if (!formData.dob) newErrors.dob = t.errors.dobInvalid;
    
    // Email tùy chọn nhưng phải đúng định dạng nếu nhập
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }
    
    // SĐT bắt buộc
    if (!formData.phone.trim()) {
      newErrors.phone = t.errors.phoneRequired;
    }
    
    // Mật khẩu
    if (!formData.password) {
      newErrors.password = t.errors.required;
    } else if (formData.password.length < 8) {
      newErrors.password = t.errors.passwordLength;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordMatch;
    }
    
    if (!formData.terms) {
      newErrors.terms = t.errors.termsRequired;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister(formData);
    }
  };

  const inputClass = (field: string) => `w-full py-3 bg-transparent border-b-2 outline-none transition-all font-bold ${
    errors[field] 
      ? 'border-rose-500 text-rose-500' 
      : (isFocused === field || formData[field as keyof typeof formData] 
          ? (isDark ? 'border-white text-white' : 'border-black text-black') 
          : (isDark ? 'border-white/10 text-white/50' : 'border-gray-100 text-black/50'))
  }`;

  const labelClass = (field: string) => `absolute left-0 -top-6 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
    errors[field] ? 'text-rose-500 opacity-100 translate-y-0' :
    (isFocused === field || formData[field as keyof typeof formData] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')
  }`;

  return (
    <div className={`flex min-h-screen transition-colors duration-1000 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className={`hidden lg:flex w-1/3 relative items-center justify-center overflow-hidden border-r ${isDark ? 'bg-white/5 border-white/5' : 'bg-black border-gray-100'}`}>
        <div className={`absolute inset-0 grid-bg ${isDark ? 'opacity-5' : 'opacity-10'}`} />
        <div className="relative z-10 p-16">
          <h2 className="text-6xl font-black tracking-tighter mb-6 leading-[0.85] text-white uppercase">
            Create <br/>
            <span className="text-sky-500 underline decoration-sky-500/30">Identity.</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xs font-medium leading-relaxed">
            Register your biometric data to access the secure algorithmic grid.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col p-8 md:p-16 justify-center relative overflow-y-auto custom-scrollbar">
        <button onClick={onBack} className="absolute top-10 left-10 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 opacity-40 hover:opacity-100">
          ← {tc.return}
        </button>

        <div className="max-w-2xl w-full mx-auto py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">{t.title}</h1>
            <p className="text-gray-400 font-medium">{t.subtitle}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-12">
            {/* Row 1: Username & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="relative">
                <label className={labelClass('username')}>{t.username}*</label>
                <input 
                  type="text"
                  placeholder={isFocused === 'username' ? '' : t.username}
                  className={inputClass('username')}
                  onFocus={() => setIsFocused('username')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.username}
                  onChange={(e) => { setFormData({...formData, username: e.target.value}); setErrors({...errors, username: ''}); }}
                />
                {errors.username && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.username}</p>}
              </div>
              <div className="relative">
                <label className={labelClass('id')}>{t.id}</label>
                <input 
                  type="text"
                  placeholder={isFocused === 'id' ? '' : t.id + ' (Tùy chọn)'}
                  className={inputClass('id')}
                  onFocus={() => setIsFocused('id')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.id}
                  onChange={(e) => { setFormData({...formData, id: e.target.value}); setErrors({...errors, id: ''}); }}
                />
              </div>
            </div>

            {/* Row 2: Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="relative">
                <label className={labelClass('surname')}>{t.surname}*</label>
                <input 
                  type="text"
                  placeholder={isFocused === 'surname' ? '' : t.surname}
                  className={inputClass('surname')}
                  onFocus={() => setIsFocused('surname')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.surname}
                  onChange={(e) => { setFormData({...formData, surname: e.target.value}); setErrors({...errors, surname: ''}); }}
                />
                {errors.surname && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.surname}</p>}
              </div>
              <div className="relative">
                <label className={labelClass('givenName')}>{t.givenName}*</label>
                <input 
                  type="text"
                  placeholder={isFocused === 'givenName' ? '' : t.givenName}
                  className={inputClass('givenName')}
                  onFocus={() => setIsFocused('givenName')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.givenName}
                  onChange={(e) => { setFormData({...formData, givenName: e.target.value}); setErrors({...errors, givenName: ''}); }}
                />
                {errors.givenName && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.givenName}</p>}
              </div>
            </div>

            {/* Row 3: Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="relative">
                <label className={labelClass('email')}>{t.email}</label>
                <input 
                  type="email"
                  placeholder={isFocused === 'email' ? '' : t.email}
                  className={inputClass('email')}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.email}
                  onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''}); }}
                />
                {errors.email && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.email}</p>}
              </div>
              <div className="relative">
                <label className={labelClass('phone')}>{t.phone}*</label>
                <input 
                  type="tel"
                  placeholder={isFocused === 'phone' ? '' : t.phone}
                  className={inputClass('phone')}
                  onFocus={() => setIsFocused('phone')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.phone}
                  onChange={(e) => { setFormData({...formData, phone: e.target.value}); setErrors({...errors, phone: ''}); }}
                />
                {errors.phone && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.phone}</p>}
              </div>
            </div>

            {/* Row 4: DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="relative">
                <label className={labelClass('dob')}>{t.dob}*</label>
                <input 
                  type="date"
                  className={inputClass('dob')}
                  onFocus={() => setIsFocused('dob')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.dob}
                  onChange={(e) => { setFormData({...formData, dob: e.target.value}); setErrors({...errors, dob: ''}); }}
                />
                {errors.dob && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.dob}</p>}
              </div>
            </div>

            {/* Row 5: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="relative">
                <label className={labelClass('password')}>{t.password}*</label>
                <input 
                  type="password"
                  placeholder={isFocused === 'password' ? '' : t.password}
                  className={inputClass('password')}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.password}
                  onChange={(e) => { setFormData({...formData, password: e.target.value}); setErrors({...errors, password: ''}); }}
                />
                {errors.password && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.password}</p>}
              </div>
              <div className="relative">
                <label className={labelClass('confirmPassword')}>{t.confirmPassword}*</label>
                <input 
                  type="password"
                  placeholder={isFocused === 'confirmPassword' ? '' : t.confirmPassword}
                  className={inputClass('confirmPassword')}
                  onFocus={() => setIsFocused('confirmPassword')}
                  onBlur={() => setIsFocused(null)}
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData({...formData, confirmPassword: e.target.value}); setErrors({...errors, confirmPassword: ''}); }}
                />
                {errors.confirmPassword && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.terms}
                  onChange={e => { setFormData({...formData, terms: e.target.checked}); setErrors({...errors, terms: ''}); }}
                  className={`mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black ${isDark ? 'bg-white/5 border-white/10' : ''}`} 
                />
                <span className={`text-[10px] font-black uppercase tracking-widest leading-relaxed transition-colors ${errors.terms ? 'text-rose-500' : (isDark ? 'text-white/40 group-hover:text-white' : 'text-gray-500 group-hover:text-black')}`}>
                  {t.terms}
                </span>
              </label>
              {errors.terms && <p className="text-[8px] font-bold text-rose-500 uppercase mt-2 tracking-widest">{errors.terms}</p>}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
              <button 
                type="submit"
                className={`w-full sm:w-auto px-16 py-5 font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl text-[10px] uppercase tracking-[0.2em] ${isDark ? 'bg-white text-black shadow-white/5' : 'bg-black text-white shadow-black/10'}`}
              >
                {t.submit}
              </button>
              
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                {t.hasAccount} 
                <button type="button" onClick={onGoToLogin} className="ml-2 text-sky-500 hover:underline">
                  {locales[language].auth.signIn}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
