import { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Sun,
  User as UserIcon,
  Users,
  X
} from 'lucide-react';
import { SignIn } from './components/SignIn';
import { LeanDashboard } from './components/LeanDashboard';
import { LeanAccountsTab } from './components/LeanAccountsTab';
import { LeanContactsTab } from './components/LeanContactsTab';
import { LeanAutomationsTab } from './components/LeanAutomationsTab';
import { LeanTasksTab } from './components/LeanTasksTab';
import { LeanReportsTab } from './components/LeanReportsTab';
import { authService } from './auth';
import { dbService } from './services/db';
import { Account, Automation, Contact, Report, Task } from './types';

type AppTheme = 'dark' | 'light';

const getInitialTheme = (): AppTheme => {
  const savedTheme = window.localStorage.getItem('workflow-zero-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('workflow-zero-theme', theme);
  }, [theme]);

  const navigate = (tab: string) => {
    const path = tab === 'dashboard' ? '/' : `/${tab}`;
    window.history.pushState(null, '', path);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      const [tab] = window.location.pathname.split('/').filter(Boolean);
      setActiveTab(tab || 'dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [
        fetchedAccounts,
        fetchedContacts,
        fetchedAutomations,
        fetchedTasks,
        fetchedReports
      ] = await Promise.all([
        dbService.getAccounts(),
        dbService.getContacts(),
        dbService.getAutomations(),
        dbService.getTasks(),
        dbService.getReports()
      ]);

      setAccounts(fetchedAccounts);
      setContacts(fetchedContacts);
      setAutomations(fetchedAutomations);
      setTasks(fetchedTasks);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error loading CRM data', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [fetchData, user]);

  const handleAddAccount = async (record: Omit<Account, 'id' | 'createdAt'>) => {
    const added = await dbService.addAccount(record);
    setAccounts(prev => [...prev, added]);
  };

  const handleUpdateAccount = async (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => {
    await dbService.updateAccount(id, updates);
    setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteAccount = async (id: string) => {
    await dbService.deleteAccount(id);
    setAccounts(prev => prev.filter(item => item.id !== id));
  };

  const handleAddContact = async (record: Omit<Contact, 'id' | 'createdAt'>) => {
    const added = await dbService.addContact(record);
    setContacts(prev => [...prev, added]);
  };

  const handleUpdateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>) => {
    await dbService.updateContact(id, updates);
    setContacts(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteContact = async (id: string) => {
    await dbService.deleteContact(id);
    setContacts(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAutomation = async (record: Omit<Automation, 'id' | 'createdAt'>) => {
    const added = await dbService.addAutomation(record);
    setAutomations(prev => [...prev, added]);
  };

  const handleUpdateAutomation = async (id: string, updates: Partial<Omit<Automation, 'id' | 'createdAt'>>) => {
    await dbService.updateAutomation(id, updates);
    setAutomations(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteAutomation = async (id: string) => {
    await dbService.deleteAutomation(id);
    setAutomations(prev => prev.filter(item => item.id !== id));
  };

  const handleAddTask = async (record: Omit<Task, 'id' | 'createdAt'>) => {
    const added = await dbService.addTask(record);
    setTasks(prev => [...prev, added]);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    await dbService.updateTask(id, updates);
    setTasks(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteTask = async (id: string) => {
    await dbService.deleteTask(id);
    setTasks(prev => prev.filter(item => item.id !== id));
  };

  const handleAddReport = async (record: Omit<Report, 'id' | 'createdAt'>) => {
    const added = await dbService.addReport(record);
    setReports(prev => [...prev, added]);
  };

  const handleUpdateReport = async (id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>) => {
    await dbService.updateReport(id, updates);
    setReports(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteReport = async (id: string) => {
    await dbService.deleteReport(id);
    setReports(prev => prev.filter(item => item.id !== id));
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'accounts', label: 'Accounts', icon: <Users size={18} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={18} /> },
    { id: 'automations', label: 'Automations', icon: <Bot size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListChecks size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={18} /> }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'accounts':
        return <LeanAccountsTab accounts={accounts} contacts={contacts} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onDeleteAccount={handleDeleteAccount} />;
      case 'contacts':
        return <LeanContactsTab contacts={contacts} accounts={accounts} onAddContact={handleAddContact} onUpdateContact={handleUpdateContact} onDeleteContact={handleDeleteContact} />;
      case 'automations':
        return <LeanAutomationsTab automations={automations} accounts={accounts} onAddAutomation={handleAddAutomation} onUpdateAutomation={handleUpdateAutomation} onDeleteAutomation={handleDeleteAutomation} />;
      case 'tasks':
        return <LeanTasksTab tasks={tasks} accounts={accounts} contacts={contacts} automations={automations} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />;
      case 'reports':
        return <LeanReportsTab reports={reports} accounts={accounts} automations={automations} onAddReport={handleAddReport} onUpdateReport={handleUpdateReport} onDeleteReport={handleDeleteReport} />;
      default:
        return <LeanDashboard accounts={accounts} contacts={contacts} automations={automations} tasks={tasks} reports={reports} setActiveTab={navigate} />;
    }
  };

  if (loadingAuth) return <div className="loading-screen">Loading workspace...</div>;
  if (!user) return <SignIn onAuthSuccess={() => fetchData()} />;

  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <button className="brand-lockup" onClick={() => navigate('dashboard')}>
          <img src="/logo.png" alt="Workflow Zero Logo" />
          <span>Workflow Zero CRM</span>
        </button>

        <nav className="desktop-nav compact-nav">
          {navItems.map(item => (
            <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="user-actions desktop-only">
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'dark' ? 'Switch to light view' : 'Switch to dark view'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <div className="user-pill">
            <UserIcon size={14} />
            <span>{user.displayName || user.email}</span>
          </div>
          <button onClick={handleSignOut} className="btn-icon" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>

        <button className="btn-icon mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} title="Menu">
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-drawer no-print">
          {navItems.map(item => (
            <button key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light View' : 'Dark View'}</span>
          </button>
          <button onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      <main className="app-main">
        {renderActiveTab()}
      </main>
    </div>
  );
}
