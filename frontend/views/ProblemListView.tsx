
import React, { useState, useEffect } from 'react';
import { Problem, User } from '../types';
import { MOCK_PROBLEMS } from '../constants';
import { Modal } from '../components/Modal';
import { locales } from '../locales';

interface ProblemListViewProps {
  user: User | null;
  onProblemClick: (p: Problem) => void;
  onEditProblem: (p: Problem) => void;
  onNewProblem: () => void;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  onModalToggle?: (active: boolean) => void;
}

export const ProblemListView: React.FC<ProblemListViewProps> = ({ user, onProblemClick, onEditProblem, onNewProblem, theme, language, onModalToggle }) => {
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [search, setSearch] = useState('');
  const isDark = theme === 'dark';
  const t = locales[language].problems;
  const tc = locales[language].common;
  const [activeFilter, setActiveFilter] = useState('All');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; problemId: string | null }>({ isOpen: false, problemId: null });

  const canEdit = user?.role === 'Teacher' || user?.role === 'Admin';
  const filters = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    if (onModalToggle) {
      onModalToggle(deleteModal.isOpen);
    }
  }, [deleteModal.isOpen, onModalToggle]);

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter === 'All' || p.difficulty === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, problemId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.problemId) {
      setProblems(prev => prev.filter(p => p.id !== deleteModal.problemId));
      setDeleteModal({ isOpen: false, problemId: null });
    }
  };

  return (
    <div className="pb-24 animate-fadeIn">
      <Modal 
        isOpen={deleteModal.isOpen}
        theme={theme}
        language={language}
        type="danger"
        title={t.purgeTitle}
        message={t.purgeMessage}
        confirmText={tc.delete}
        onClose={() => setDeleteModal({ isOpen: false, problemId: null })}
        onConfirm={confirmDelete}
      />

      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-[2px] ${isDark ? 'bg-white' : 'bg-black'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">{t.subtitle}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight">{t.title}</h1>
        </div>
        {canEdit && (
          <button 
            onClick={onNewProblem}
            className={`px-10 py-4 font-black rounded-[1.5rem] text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${isDark ? 'bg-white text-black shadow-white/5' : 'bg-black text-white shadow-black/20'}`}
          >
            {t.newManifest}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-12">
        <div className="relative group w-full md:w-[400px]">
          <input 
            type="text"
            placeholder={tc.search}
            className={`w-full pl-0 pr-4 py-3 bg-transparent border-b-2 outline-none transition-all font-bold placeholder:text-gray-300 ${isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={`flex gap-1 p-1 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeFilter === f 
                ? (isDark ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm') 
                : 'text-gray-400 hover:text-current'
              }`}
            >
              {f === 'All' ? tc.all : tc[f.toLowerCase()]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className={`border-b-2 ${isDark ? 'border-white' : 'border-black'}`}>
                <th className="pb-6 pr-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 w-16 text-center">{t.id}</th>
                <th className="pb-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t.name}</th>
                <th className="pb-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t.tier}</th>
                <th className="pb-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">{t.acceptance}</th>
                <th className="pb-6 pl-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-right">{t.ops}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {filteredProblems.map((p, idx) => (
                <tr 
                  key={p.id} 
                  className={`group transition-all cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                  onClick={() => onProblemClick(p)}
                >
                  <td className="py-8 pr-6 font-mono text-xs opacity-40 text-center">
                    {(idx + 1).toString().padStart(3, '0')}
                  </td>
                  <td className="py-8 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-lg group-hover:text-sky-500 transition-colors tracking-tighter leading-tight">
                        {p.title}
                      </span>
                      <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {p.tags.map(t => (
                          <span key={t} className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        p.difficulty === 'Easy' ? 'bg-emerald-500' : 
                        p.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        p.difficulty === 'Easy' ? 'text-emerald-500' : 
                        p.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {tc[p.difficulty.toLowerCase()]}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-6 text-right">
                    <span className="font-mono text-sm font-black opacity-70">
                      {p.acceptanceRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-8 pl-6 text-right">
                    <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                      {canEdit ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditProblem(p); }}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isDark ? 'bg-white/5 text-white hover:bg-white hover:text-black' : 'bg-black/5 text-black hover:bg-black hover:text-white'}`} 
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, p.id)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isDark ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`} 
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-current group-hover:text-white dark:group-hover:text-black transition-all transform group-hover:rotate-45 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
