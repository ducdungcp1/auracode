
import React, { useState } from 'react';
import { Problem, Difficulty } from '../types';
import { locales } from '../locales';

interface ProblemEditorViewProps {
  problem?: Problem;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  onSave: (p: Partial<Problem>) => void;
  onBack: () => void;
}

export const ProblemEditorView: React.FC<ProblemEditorViewProps> = ({ problem, theme, language, onSave, onBack }) => {
  const isDark = theme === 'dark';
  const t = locales[language].editor;
  const tc = locales[language].common;
  const ts = locales[language].solve;
  
  const [formData, setFormData] = useState({
    title: problem?.title || '',
    difficulty: (problem?.difficulty as Difficulty) || 'Medium',
    timeLimit: problem?.timeLimit || '1.000s',
    memoryLimit: problem?.memoryLimit || '256 MB',
    description: problem?.description || '',
    mode: 'Standard', 
    contentType: 'Manual',
  });

  const [samples, setSamples] = useState(problem?.samples || [{ input: '', output: '' }]);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const modeOptions = ['Standard', 'HSG'];

  const SegmentedControl = ({ options, active, onChange, labels }: any) => (
    <div className={`p-1 rounded-[1.2rem] border flex transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200 shadow-inner'}`}>
      {options.map((opt: string) => {
        const isActive = active === opt;
        return (
          <button 
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-6 py-2.5 rounded-[0.9rem] text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
              isActive 
                ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg') 
                : 'text-gray-400 hover:text-current'
            }`}
          >
            {labels ? labels[opt] : opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="pb-24 animate-fadeIn">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={onBack} className="text-[10px] font-black text-gray-400 hover:text-current transition-all uppercase tracking-[0.2em] mb-4 flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> {tc.return}
          </button>
          <h1 className="text-5xl font-black tracking-tighter">
            {problem ? t.editTitle : t.createTitle}
          </h1>
        </div>
        <div className="flex flex-col gap-4">
           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t.env}</label>
           <SegmentedControl 
              options={modeOptions} 
              active={formData.mode} 
              onChange={(m: string) => setFormData({...formData, mode: m})}
              labels={{ 'Standard': t.modeStandard, 'HSG': t.modeHSG }}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Core Configuration */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">{t.coreConfig}</h2>
              <div className="flex-1 h-[1px] bg-gray-100 dark:bg-white/5"></div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest block opacity-60">{locales[language].problems.name}</label>
              <input 
                type="text" 
                placeholder={t.titlePlaceholder}
                className={`w-full px-8 py-5 rounded-[2rem] border-2 transition-all outline-none font-bold text-lg ${isDark ? 'bg-white/5 border-white/5 focus:border-white' : 'bg-white border-gray-100 focus:border-black shadow-sm'}`}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest block opacity-60">{t.difficulty}</label>
              <div className="relative w-fit">
                <button 
                  onClick={() => setIsDiffOpen(!isDiffOpen)}
                  className={`flex items-center gap-4 px-8 py-3.5 rounded-2xl transition-all duration-300 group min-w-[180px] border-2 ${
                    isDiffOpen 
                      ? (isDark ? 'bg-white border-white text-black' : 'bg-black border-black text-white')
                      : (isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-black shadow-sm')
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {tc[formData.difficulty.toLowerCase()] || formData.difficulty}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isDiffOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDiffOpen && (
                  <div className={`absolute top-full left-0 mt-3 w-full rounded-2xl shadow-2xl py-2 z-50 animate-fadeInScale overflow-hidden border ${isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-100 text-black'}`}>
                    {difficultyOptions.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setFormData({...formData, difficulty: opt}); setIsDiffOpen(false); }}
                        className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                      >
                        {tc[opt.toLowerCase()] || opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest block opacity-60">{ts.timeLimit}</label>
                <input 
                  type="text" 
                  className={`w-full px-8 py-5 rounded-2xl border-2 transition-all outline-none font-bold ${isDark ? 'bg-white/5 border-white/5 focus:border-white' : 'bg-white border-gray-100 focus:border-black'}`}
                  value={formData.timeLimit}
                  onChange={e => setFormData({...formData, timeLimit: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest block opacity-60">{ts.memLimit}</label>
                <input 
                  type="text" 
                  className={`w-full px-8 py-5 rounded-2xl border-2 transition-all outline-none font-bold ${isDark ? 'bg-white/5 border-white/5 focus:border-white' : 'bg-white border-gray-100 focus:border-black'}`}
                  value={formData.memoryLimit}
                  onChange={e => setFormData({...formData, memoryLimit: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Statement Content */}
          <section className="space-y-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">{t.testcase}</h2>
            <div className={`p-10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-4">📦</div>
              <p className="text-[11px] font-black uppercase tracking-widest mb-4">{t.uploadTest}</p>
              <p className="text-xs text-gray-400 mb-6">{t.testDesc}</p>
              <input type="file" className="hidden" id="test-upload" />
              <label htmlFor="test-upload" className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${isDark ? 'bg-white text-black shadow-lg shadow-white/5' : 'bg-black text-white shadow-lg shadow-black/20'}`}>
                {tc.confirm.toUpperCase()}
              </label>
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <div className={`p-10 rounded-[3rem] border sticky top-28 transition-all duration-500 ${isDark ? 'bg-[#0a0a0a] border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-xl'}`}>
              <h3 className="text-2xl font-black tracking-tighter mb-6">{problem ? t.update : t.publish}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed mb-12">Confirm manifest synchronization with the judging grid.</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => onSave({...formData, samples: []})}
                  className={`w-full py-6 font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 ${isDark ? 'bg-white text-black shadow-white/10' : 'bg-black text-white shadow-black/20'}`}
                >
                  {tc.save}
                </button>
                <button 
                  onClick={onBack}
                  className={`w-full py-6 font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  {tc.discard}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
