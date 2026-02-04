
import React, { useState, useEffect } from 'react';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { RegisterView } from './views/RegisterView';
import { VerificationView } from './views/VerificationView';
import { DashboardView } from './views/DashboardView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { ProblemSolveView } from './views/ProblemSolveView';
import { ProblemListView } from './views/ProblemListView';
import { ProblemEditorView } from './views/ProblemEditorView';
import { LeaderboardView } from './views/LeaderboardView';
import { LearningView } from './views/LearningView';
import { SettingsView } from './views/SettingsView';
import { AccountSettingsView } from './views/AccountSettingsView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SkyBackground } from './components/SkyBackground';
import { LoadingOverlay } from './components/LoadingOverlay';
import { DEFAULT_ADMIN } from './constants';
import { User, Problem, UserRank, RegistrationData } from './types';

type ViewState = 'LANDING' | 'AUTH' | 'REGISTER' | 'VERIFY' | 'DASHBOARD' | 'TEACHER_DASHBOARD' | 'PROBLEM_LIST' | 'PROBLEM_SOLVE' | 'PROBLEM_EDITOR' | 'LEADERBOARD' | 'LEARNING' | 'SETTINGS' | 'ACCOUNT_SETTINGS';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Simulated Database - Initialized with only Admin as requested
  const [users, setUsers] = useState<User[]>([
    DEFAULT_ADMIN
  ]);

  const [loginError, setLoginError] = useState<string | undefined>();
  const [pendingRegistration, setPendingRegistration] = useState<User | null>(null);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);

  const isAdmin = user?.rank === UserRank.ADMIN;

  const navigateWithLoading = (nextView: ViewState) => {
    if (view === nextView) return;
    setIsNavigating(true);
    setIsExiting(false);
    
    setTimeout(() => {
      setView(nextView);
      // Bắt đầu phase biến mất
      setIsExiting(true);
      setTimeout(() => {
        setIsNavigating(false);
        setIsExiting(false);
      }, 500); // Thời gian fade out
      window.scrollTo(0, 0);
    }, 800);
  };

  const handleLogin = (username: string, pass: string) => {
    const found = users.find(u => u.username === username && u.password === pass);
    if (found) {
      if (!found.verified) {
        setPendingRegistration(found);
        navigateWithLoading('VERIFY');
        return;
      }
      setUser(found);
      navigateWithLoading('DASHBOARD');
      setLoginError(undefined);
    } else {
      setLoginError(language === 'vi' ? 'Sai tài khoản hoặc mật khẩu.' : 'Invalid credentials.');
    }
  };

  const handleRegisterSuccess = (data: RegistrationData) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: data.username,
      password: data.password,
      fullName: `${data.surname} ${data.givenName}`.trim(),
      email: data.email,
      phone: data.phone,
      studentId: data.id,
      dob: data.dob,
      role: 'Student', 
      rank: UserRank.STUDENT, 
      verified: false,
      stats: { problemsSolved: 0, points: 0, rank: users.length }
    };
    
    setUsers(prev => [...prev, newUser]);
    setPendingRegistration(newUser);
    navigateWithLoading('VERIFY');
  };

  const handleVerificationSuccess = () => {
    if (pendingRegistration) {
      setUsers(prev => prev.map(u => u.id === pendingRegistration.id ? { ...u, verified: true } : u));
      setPendingRegistration(null);
    }
    navigateWithLoading('AUTH');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (user?.id === userId) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigateWithLoading('LANDING');
    setIsSidebarOpen(false);
  };

  const navigateToSolve = (problem: Problem) => {
    setActiveProblem(problem);
    navigateWithLoading('PROBLEM_SOLVE');
  };

  const navigateToEdit = (problem: Problem) => {
    setActiveProblem(problem);
    navigateWithLoading('PROBLEM_EDITOR');
  };

  const mainContentClass = `transition-all duration-500 pt-20 ${
    view !== 'AUTH' && view !== 'REGISTER' && view !== 'VERIFY' && view !== 'PROBLEM_SOLVE' 
      ? `px-6 max-w-7xl mx-auto min-h-screen` 
      : ''
  } ${isAdmin && isSidebarOpen && !isModalActive ? 'pl-72' : ''}`;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <SkyBackground theme={theme} />
      {isNavigating && <LoadingOverlay theme={theme} isExiting={isExiting} />}
      
      {view !== 'AUTH' && view !== 'REGISTER' && view !== 'VERIFY' && (
        <Navbar 
          user={user} 
          currentView={view}
          theme={theme}
          language={language}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onToggleLanguage={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          onNavigate={(v) => { 
            navigateWithLoading(v as ViewState); 
            if (!isAdmin) setIsSidebarOpen(false); 
          }} 
          onLogout={handleLogout}
          onLogin={() => { setLoginError(undefined); navigateWithLoading('AUTH'); }}
        />
      )}

      {isAdmin && !isModalActive && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          theme={theme} 
          language={language}
          currentView={view} 
          onNavigate={(v) => navigateWithLoading(v as ViewState)} 
        />
      )}

      <main className={mainContentClass}>
        {view === 'LANDING' && <LandingView onStart={() => navigateWithLoading('AUTH')} onGoToProblems={() => navigateWithLoading('PROBLEM_LIST')} theme={theme} language={language} />}
        {view === 'AUTH' && <AuthView onLogin={handleLogin} onGoToRegister={() => navigateWithLoading('REGISTER')} onBack={() => navigateWithLoading('LANDING')} language={language} theme={theme} loginError={loginError} />}
        {view === 'REGISTER' && <RegisterView onRegister={handleRegisterSuccess} onGoToLogin={() => navigateWithLoading('AUTH')} onBack={() => navigateWithLoading('LANDING')} language={language} theme={theme} />}
        {view === 'VERIFY' && <VerificationView email={pendingRegistration?.email || ''} phone={pendingRegistration?.phone || ''} onVerified={handleVerificationSuccess} onBack={() => navigateWithLoading('REGISTER')} language={language} theme={theme} />}
        {view === 'DASHBOARD' && user && <DashboardView user={user} onProblemClick={navigateToSolve} onNavigate={(v) => navigateWithLoading(v as ViewState)} theme={theme} language={language} />}
        {view === 'TEACHER_DASHBOARD' && <TeacherDashboardView users={users} theme={theme} language={language} />}
        {view === 'PROBLEM_LIST' && (
          <ProblemListView 
            user={user} 
            theme={theme}
            language={language}
            onProblemClick={navigateToSolve} 
            onEditProblem={navigateToEdit}
            onNewProblem={() => { setActiveProblem(null); navigateWithLoading('PROBLEM_EDITOR'); }}
            onModalToggle={setIsModalActive}
          />
        )}
        {view === 'PROBLEM_EDITOR' && (
          <ProblemEditorView 
            problem={activeProblem || undefined}
            theme={theme}
            language={language}
            onSave={(p) => { navigateWithLoading('PROBLEM_LIST'); }}
            onBack={() => navigateWithLoading('PROBLEM_LIST')}
          />
        )}
        {view === 'LEADERBOARD' && <LeaderboardView users={users} currentUser={user} language={language} theme={theme} />}
        {view === 'LEARNING' && <LearningView onProblemClick={navigateToSolve} language={language} theme={theme} />}
        {view === 'SETTINGS' && (
          <SettingsView 
            user={user} 
            users={users}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            theme={theme} 
            language={language} 
            onModalToggle={setIsModalActive} 
          />
        )}
        {view === 'ACCOUNT_SETTINGS' && user && (
          <AccountSettingsView 
            user={user} 
            theme={theme} 
            language={language} 
            onSave={(u) => { 
              const updated = {...user, ...u};
              setUser(updated);
              setUsers(prev => prev.map(usr => usr.id === updated.id ? updated : usr));
              navigateWithLoading('DASHBOARD'); 
            }}
          />
        )}
        {view === 'PROBLEM_SOLVE' && activeProblem && (
          <div className="h-[calc(100vh-5rem)]">
             <ProblemSolveView 
                problem={activeProblem} 
                theme={theme}
                language={language}
                onBack={() => navigateWithLoading('PROBLEM_LIST')} 
              />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
