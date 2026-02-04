
import React, { useState, useEffect } from 'react';
import { User, UserRank } from '../types';
import { locales } from '../locales';
import { Modal } from '../components/Modal';

interface SettingsViewProps {
  user: User | null;
  users: User[]; // Danh sách thực tế từ App
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  onModalToggle?: (active: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, users, onUpdateUser, onDeleteUser, theme, language, onModalToggle }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'nodes' | 'general'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  
  const isDark = theme === 'dark';
  const t = locales[language].settings;
  const tc = locales[language].common;

  useEffect(() => {
    if (onModalToggle) {
      onModalToggle(deleteModal.isOpen || editModal.isOpen);
    }
  }, [deleteModal.isOpen, editModal.isOpen, onModalToggle]);

  if (!user || user.rank !== UserRank.ADMIN) {
    return <div className="py-20 text-center font-black">Access Denied. System privileges required.</div>;
  }

  const nodes = [
    { name: 'Main-Grid-A', threads: 16, status: 'Healthy' },
    { name: 'Worker-Edge-B', threads: 8, status: 'Busy' },
  ];

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery) ||
    (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'Admin': return t.roleAdmin;
      case 'Teacher': return t.roleTeacher;
      case 'Student': return t.roleStudent;
      default: return tc.all;
    }
  };

  const getRankFromRole = (role: string): UserRank => {
    switch(role) {
      case 'Admin': return UserRank.ADMIN;
      case 'Teacher': return UserRank.TEACHER;
      case 'Student': return UserRank.STUDENT;
      default: return UserRank.USER;
    }
  };

  const SegmentedControl = ({ options, active, onChange }: any) => (
    <div className={`p-1 rounded-[1.5rem] border flex mb-12 w-fit ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200 shadow-inner'}`}>
      {options.map((opt: any) => (
        <button 
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active === opt.id ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg') : 'text-gray-400 hover:text-current'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, userId: id });
  };

  const confirmPurge = () => {
    if (deleteModal.userId) {
      onDeleteUser(deleteModal.userId);
      setDeleteModal({ isOpen: false, userId: null });
    }
  };

  const handleEdit = (u: User) => {
    setEditModal({ isOpen: true, user: { ...u } });
  };

  const saveEdit = () => {
    if (editModal.user) {
      onUpdateUser(editModal.user);
      setEditModal({ isOpen: false, user: null });
    }
  };

  return (
    <div className="pb-24 animate-fadeIn">
      <Modal 
        isOpen={deleteModal.isOpen}
        theme={theme}
        language={language}
        type="danger"
        title={t.purgeUserTitle}
        message={t.purgeUserMessage}
        confirmText={t.purgeConfirm}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={confirmPurge}
      />

      {editModal.isOpen && editModal.user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setEditModal({ isOpen: false, user: null })} />
          <div className={`relative w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-fadeInScale border ${isDark ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-gray-100 text-black'}`}>
            <h3 className="text-2xl font-black tracking-tighter mb-8 uppercase">{t.editUserTitle}</h3>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">{t.name}</label>
                <input 
                  type="text" 
                  value={editModal.user.fullName} 
                  onChange={e => setEditModal({...editModal, user: { ...editModal.user!, fullName: e.target.value }})}
                  className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none font-bold text-sm ${isDark ? 'bg-white/5 border-white/5 focus:border-white' : 'bg-gray-50 border-gray-100 focus:border-black'}`}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-2">{t.role}</label>
                <div className={`p-1 rounded-2xl border flex ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  {['Student', 'Teacher', 'Admin'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setEditModal({...editModal, user: { ...editModal.user!, role: r as any, rank: getRankFromRole(r) }})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editModal.user?.role === r ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-gray-400'}`}
                    >
                      {getRoleLabel(r)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setEditModal({ isOpen: false, user: null })}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {tc.discard}
              </button>
              <button 
                onClick={saveEdit}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                {tc.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter uppercase">{t.title}</h1>
      </div>

      <SegmentedControl 
        options={[
          { id: 'users', label: t.userMgmt },
          { id: 'nodes', label: t.judgeNodes },
          { id: 'general', label: t.security }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'users' && (
        <div className="animate-fadeIn">
          <div className="mb-8 relative group max-w-md">
            <input 
              type="text" 
              placeholder={t.userSearchPlaceholder}
              className={`w-full pl-0 pr-10 py-4 bg-transparent border-b-2 outline-none transition-all font-bold placeholder:text-gray-300 ${isDark ? 'border-white/10 focus:border-white' : 'border-gray-100 focus:border-black'}`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-[#0f0f0f] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <tr>
                    <th className="px-8 py-6">{t.username}</th>
                    <th className="px-8 py-6">{t.name}</th>
                    <th className="px-8 py-6">{t.role}</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">{locales[language].problems.ops}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-sm">{u.username}</span>
                          <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{u.studentId || "NO-ID"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{u.fullName}</span>
                          <span className="text-[10px] opacity-40 font-medium">{u.phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                          u.rank === UserRank.ADMIN ? 'bg-sky-50 text-sky-600' :
                          u.rank === UserRank.TEACHER ? 'bg-amber-50 text-amber-600' : 
                          u.rank === UserRank.STUDENT ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.verified ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${u.verified ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {u.verified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(u)}
                          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105'}`}
                        >
                          {tc.edit}
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-rose-500 text-white hover:scale-105 shadow-lg shadow-rose-500/10`}
                        >
                          {t.purgeLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          {nodes.map((n, idx) => (
            <div key={idx} className={`p-10 rounded-[3rem] border transition-all ${isDark ? 'bg-[#0f0f0f] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
               <div className="flex justify-between items-start mb-10">
                 <h3 className="text-2xl font-black tracking-tighter uppercase">{n.name}</h3>
                 <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${n.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                   {n.status.toUpperCase()}
                 </span>
               </div>
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.threads}</span>
                        <span className="text-2xl font-black">{n.threads} CPU</span>
                     </div>
                     <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div className="h-full bg-emerald-500 w-1/2 transition-all duration-1000" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Average</span>
                     <span className="text-sm font-black">0.42 / 1.00</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
