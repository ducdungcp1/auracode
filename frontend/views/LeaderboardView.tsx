
import React, { useMemo } from 'react';
import { locales } from '../locales';
import { User, UserRank } from '../types';

interface LeaderboardViewProps {
  users: User[];
  currentUser: User | null;
  language: 'vi' | 'en';
  theme: 'light' | 'dark';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, currentUser, language, theme }) => {
  const isDark = theme === 'dark';
  const t = locales[language].leaderboard;

  // Logic: Lọc lấy các tài khoản có tư cách là người học tham gia xếp hạng (USER/STUDENT)
  const students = useMemo(() => {
    return users
      .filter(u => (u.rank === UserRank.STUDENT || u.rank === UserRank.USER) && u.verified)
      .sort((a, b) => b.stats.points - a.stats.points)
      .map((u, index) => ({
        ...u,
        rankPos: index + 1
      }));
  }, [users]);

  const topThree = students.slice(0, 3);
  const tableList = students; 

  return (
    <div className="pb-24 space-y-16 animate-fadeIn">
      <section className={`border-b pb-12 transition-colors ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-[2px] ${isDark ? 'bg-white' : 'bg-black'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Security Grid Ranking</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase">{t.title}</h1>
        <p className={`text-lg font-medium max-w-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
      </section>

      {/* Top 3 Podium - Only show if there are members */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* Order: 2 - 1 - 3 on desktop for podium effect */}
          {[topThree[1], topThree[0], topThree[2]].map((r, idx) => {
            if (!r) return <div key={idx} className="hidden md:block" />;
            const isWinner = r.rankPos === 1;
            const isMe = r.id === currentUser?.id;
            
            return (
              <div 
                key={r.id} 
                className={`p-10 rounded-[3rem] border relative overflow-hidden transition-all duration-700 hover:scale-[1.03] flex flex-col items-center text-center ${
                  isWinner 
                    ? (isDark ? 'bg-white text-black border-white shadow-[0_40px_80px_-15px_rgba(255,255,255,0.1)] py-16' : 'bg-black text-white border-black shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] py-16') 
                    : (isDark ? 'bg-white/5 text-white border-white/5' : 'bg-gray-50 text-black border-gray-100 shadow-sm')
                }`}
              >
                {isMe && (
                  <div className={`absolute top-0 inset-x-0 h-1 ${isWinner ? (isDark ? 'bg-black/20' : 'bg-white/20') : 'bg-sky-500'}`} />
                )}
                
                <div className={`absolute top-6 left-6 font-black text-[80px] leading-none opacity-5 select-none`}>
                  {r.rankPos}
                </div>
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-8 border-4 transition-transform group-hover:rotate-12 ${isWinner ? (isDark ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20') : 'bg-sky-500/10 border-sky-500/20'}`}>
                  {r.rankPos === 1 ? '🥇' : r.rankPos === 2 ? '🥈' : '🥉'}
                </div>
                
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isWinner ? 'opacity-40' : 'text-gray-400'}`}>
                  {t.rank} {r.rankPos} {isMe && `(${language === 'vi' ? 'BẠN' : 'YOU'})`}
                </p>
                
                <h3 className="text-2xl font-black mb-8 truncate tracking-tight uppercase">{r.username}</h3>
                
                <div className="w-full space-y-4 pt-6 border-t border-current opacity-20">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.points}</span>
                    <span className="text-xl font-black">{r.stats.points.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.solved}</span>
                    <span className="text-sm font-black">{r.stats.problemsSolved}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Ranking Table */}
      <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${isDark ? 'bg-[#0a0a0a] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <tr>
                <th className="px-10 py-8 w-24 text-center">#</th>
                <th className="px-10 py-8">{t.coder}</th>
                <th className="px-10 py-8 text-center">{t.solved}</th>
                <th className="px-10 py-8 text-right">{t.points}</th>
                <th className="px-10 py-8 text-right">{t.growth}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {tableList.length > 0 ? (
                tableList.map(r => {
                  const isMe = r.id === currentUser?.id;
                  return (
                    <tr 
                      key={r.id} 
                      className={`transition-all group ${
                        isMe 
                          ? (isDark ? 'bg-white/10' : 'bg-sky-50') 
                          : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                      }`}
                    >
                      <td className="px-10 py-8 text-center">
                        <span className={`font-black text-xl tracking-tighter ${isMe ? 'opacity-100 text-sky-500' : 'opacity-40'}`}>
                          #{r.rankPos}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-base tracking-tight uppercase ${isMe ? 'text-sky-500' : ''}`}>{r.username}</span>
                            {isMe && (
                              <span className="text-[8px] font-black bg-sky-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {language === 'vi' ? 'Bạn' : 'Me'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{r.fullName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="font-mono text-sm font-black opacity-60">{r.stats.problemsSolved}</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <span className={`font-black text-lg tracking-tight ${isMe ? 'text-sky-600' : 'text-sky-500'}`}>
                          {r.stats.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-black text-emerald-500">↑ 0.5%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20">
                      <div className="text-6xl mb-6">🏜️</div>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em]">{t.noMembers}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
