
import React from 'react';
import { User, Problem } from '../types';
import { MOCK_SUBMISSIONS, MOCK_PROBLEMS } from '../constants';
import { locales } from '../locales';

interface DashboardViewProps {
  user: User;
  onProblemClick: (p: Problem) => void;
  onNavigate: (view: string) => void;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onProblemClick, onNavigate, theme, language }) => {
  const isDark = theme === 'dark';
  const t = locales[language].dashboard;

  return (
    <div className="pb-12 space-y-12 animate-fadeIn">
      {/* Welcome Header - Optimized Scaling */}
      <section className={`flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b pb-10 transition-colors ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex gap-4 sm:gap-8 items-center w-full">
          {/* Decorative House SVG */}
          <div className={`hidden sm:block w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight truncate">{t.brief}</h1>
            <p className="text-gray-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] mt-1 break-words">
              {t.welcome} {user.username}. <span className="sm:inline block">{t.streak}</span>
            </p>
          </div>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto">
          <div className={`px-5 py-4 rounded-2xl flex flex-col justify-center min-w-[120px] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'opacity-40' : 'text-gray-400'}`}>{t.solved}</p>
            <p className="text-2xl sm:text-3xl font-black leading-none">{user.stats.problemsSolved}</p>
          </div>
          
          {/* Clickable Rank Card */}
          <button 
            onClick={() => onNavigate('LEADERBOARD')}
            className={`px-5 py-4 border-2 rounded-2xl flex flex-col justify-center text-left min-w-[120px] transition-all hover:scale-105 active:scale-95 group ${isDark ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
          >
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 transition-colors ${isDark ? 'text-gray-400 group-hover:text-black/40' : 'text-gray-400 group-hover:text-white/40'}`}>{t.rank}</p>
            <p className="text-2xl sm:text-3xl font-black leading-none flex items-center gap-2">
              #{user.stats.rank}
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </p>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Recommended Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight">{t.recommended}</h2>
              <button 
                onClick={() => onNavigate('PROBLEM_LIST')}
                className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-400 transition-colors"
              >
                {t.viewArchive}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_PROBLEMS.slice(0, 2).map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onProblemClick(p)}
                  className={`p-8 border rounded-[2rem] transition-all group cursor-pointer ${isDark ? 'border-white/5 hover:border-white/20 bg-white/5 shadow-2xl shadow-black/20' : 'border-gray-100 hover:border-black bg-white shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg ${
                      p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                      p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {locales[language].common[p.difficulty.toLowerCase()].toUpperCase()}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {p.acceptanceRate}% ACC
                    </span>
                  </div>
                  <h3 className="text-xl font-black mb-3 group-hover:text-sky-500 transition-colors tracking-tight leading-tight">{p.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent History Section */}
          <div>
            <h2 className="text-xl font-black mb-8 tracking-tight">{t.recent}</h2>
            <div className={`overflow-x-auto border rounded-3xl ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-white'}`}>
              <table className="w-full text-left min-w-[500px]">
                <thead className={`text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-8 py-5">{t.status}</th>
                    <th className="px-8 py-5">{t.problem}</th>
                    <th className="px-8 py-5">{t.language}</th>
                    <th className="px-8 py-5">{t.time}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {MOCK_SUBMISSIONS.map((s) => (
                    <tr key={s.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black uppercase ${s.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-sm tracking-tight">{s.problemTitle}</td>
                      <td className="px-8 py-5 font-mono text-xs opacity-50">{s.language}</td>
                      <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">{s.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className={`p-10 rounded-[3rem] border ${isDark ? 'bg-[#0a0a0a] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h3 className="text-lg font-black mb-8 tracking-tight">{t.mastery}</h3>
            <div className="space-y-8">
              {[
                { label: locales[language].common.easy, count: '12 / 150', color: 'bg-emerald-500', pct: '8%' },
                { label: locales[language].common.medium, count: '28 / 250', color: 'bg-amber-500', pct: '11.2%' },
                { label: locales[language].common.hard, count: '5 / 100', color: 'bg-rose-500', pct: '5%' }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-[10px] font-black">{stat.count}</span>
                  </div>
                  <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${stat.color}`} style={{ width: stat.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-10 border-2 border-dashed rounded-[3rem] transition-all group ${isDark ? 'border-white/10 hover:border-white bg-white/5' : 'border-gray-200 hover:border-black bg-gray-50'}`}>
            <h3 className="text-lg font-black mb-4 tracking-tight">{t.dailyChallenge}</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium leading-relaxed">{t.challengeDesc}</p>
            <button 
              onClick={() => onProblemClick(MOCK_PROBLEMS[2])}
              className={`w-full py-5 font-black rounded-2xl transition-all transform active:scale-95 text-[10px] uppercase tracking-[0.3em] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              {t.startChallenge}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
