
import React, { useState, useMemo } from 'react';
import { locales } from '../locales';
import { User, UserRank } from '../types';

interface TeacherDashboardViewProps {
  users: User[];
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ users, theme, language }) => {
  const [filter, setFilter] = useState('');
  const isDark = theme === 'dark';
  const t = locales[language].teacher;

  // Lấy danh sách học sinh thực tế từ state của App
  const studentData = useMemo(() => {
    return users
      .filter(u => u.rank === UserRank.STUDENT || u.rank === UserRank.USER)
      .map(u => ({
        id: u.id,
        name: u.fullName || u.username,
        // Giả sử mục tiêu là 200 bài để tính % completion
        completion: Math.min(100, Math.round((u.stats.problemsSolved / 200) * 100)),
        lastActive: 'Recent', // Simulation
        assignedProblems: 200,
        solvedCount: u.stats.problemsSolved,
        points: u.stats.points
      }));
  }, [users]);

  const filteredStudents = studentData.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
  
  const avgCompletion = studentData.length > 0 
    ? studentData.reduce((acc, s) => acc + s.completion, 0) / studentData.length 
    : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Thống kê tổng quan thực tế
  const totalSubmissions = studentData.reduce((acc, s) => acc + s.solvedCount, 0) * 3; // Giả sử trung bình 3 lần nộp cho 1 bài giải

  return (
    <div className="pb-24 animate-fadeIn">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-[2px] bg-current"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">{t.subtitle}</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter">{t.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Statistics Pie Chart Card */}
        <div className={`p-10 rounded-[2.5rem] border flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="relative w-full max-w-[14rem] aspect-square mb-8 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle 
                  cx="80" cy="80" r={radius} 
                  fill="transparent" 
                  stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 
                  strokeWidth="12" 
                />
                <circle 
                  cx="80" cy="80" r={radius} 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - avgCompletion/100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-in-out"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter">{Math.round(avgCompletion)}%</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">{t.classAvg}</span>
             </div>
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-2">{t.completion}</h3>
          <p className={`text-xs font-medium max-w-[200px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Aggregate progress across {studentData.length} active students.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className={`p-8 rounded-[2rem] border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">{t.totalSubmissions}</p>
              <h4 className="text-4xl font-black mb-2">{totalSubmissions.toLocaleString()}</h4>
              <p className="text-xs font-bold text-emerald-500">↑ {studentData.length > 0 ? 'Live' : '0%'} {t.growthLabel}</p>
           </div>
           <div className={`p-8 rounded-[2rem] border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">{t.pendingReview}</p>
              <h4 className="text-4xl font-black mb-2">0</h4>
              <p className="text-xs font-bold text-emerald-500">{language === 'vi' ? 'Hệ thống tự động sạch' : 'Auto-graded clear'}</p>
           </div>
           <div className={`p-8 rounded-[2rem] border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">{t.mostSolved}</p>
              <h4 className="text-2xl font-black mb-2">Two Sum</h4>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{locales[language].common.easy}</p>
           </div>
           <div className={`p-8 rounded-[2rem] border transition-colors duration-500 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">{t.avgRuntime}</p>
              <h4 className="text-4xl font-black mb-2">38ms</h4>
              <p className="text-xs font-bold text-sky-500">{t.optimalSpeed}</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black tracking-tight">{t.roster}</h2>
        <div className="relative group">
          <input 
            type="text" 
            placeholder={locales[language].common.search}
            className={`pl-4 pr-10 py-2.5 bg-transparent border-b-2 outline-none transition-all font-bold text-sm ${isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'}`}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className={`rounded-[2rem] border overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0f0f0f]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
         <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[800px]">
              <thead className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                 <tr>
                    <th className="px-8 py-5">{t.studentName}</th>
                    <th className="px-8 py-5">{t.completion}</th>
                    <th className="px-8 py-5">{t.mostSolved}</th>
                    <th className="px-8 py-5">{t.lastActivity}</th>
                    <th className="px-8 py-5 text-right">{locales[language].problems.ops}</th>
                 </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-500 ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                 {filteredStudents.map(student => (
                    <tr key={student.id} className={`group transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                       <td className="px-8 py-6">
                          <p className="font-black text-sm">{student.name}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4 w-48">
                             <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                <div className="h-full bg-current transition-all duration-1000 ease-out" style={{ width: `${student.completion}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black w-8">{student.completion}%</span>
                          </div>
                       </td>
                       <td className="px-8 py-6 font-mono text-xs opacity-60">
                          {student.solvedCount} / {student.assignedProblems}
                       </td>
                       <td className="px-8 py-6 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                          {student.lastActive}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button className={`px-5 py-2.5 font-black rounded-xl text-[8px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all ${isDark ? 'bg-white text-black shadow-lg shadow-white/5' : 'bg-black text-white shadow-lg shadow-black/20'}`}>
                             {t.assignTasks}
                          </button>
                       </td>
                    </tr>
                 ))}
                 {filteredStudents.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-8 py-20 text-center text-[10px] font-black uppercase opacity-20 tracking-widest">
                       Empty Registry
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
