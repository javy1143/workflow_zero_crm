import { useState, useEffect } from 'react';
import { SignIn } from './components/SignIn';
import { Dashboard } from './components/Dashboard';
import { AccountsTab } from './components/AccountsTab';
import { ContactsTab } from './components/ContactsTab';
import { ProjectsTab } from './components/ProjectsTab';

import { AssetsTab } from './components/AssetsTab';
import { VendorsTab } from './components/VendorsTab';
import { ReportsTab } from './components/ReportsTab';
import { authService } from './firebase';
import { dbService } from './services/db';
import { Account, Contact, Project, Asset, Vendor, Activity } from './types';
import { 
  LayoutDashboard, 
  Users, 
  FolderGit, 
  HardDrive, 
  Handshake, 
  FileBarChart2, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // CRM Data States
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Custom Routing logic
  const navigate = (tab: string, id?: string) => {
    const path = id ? `/${tab}/${id}` : `/${tab === 'dashboard' ? '' : tab}`;
    window.history.pushState(null, '', path);
    setActiveTab(tab);
    setSelectedId(id || null);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      if (parts.length === 0) {
        setActiveTab('dashboard');
        setSelectedId(null);
      } else if (parts.length === 1) {
        // Fallback checks for routes
        const tab = parts[0];
        setActiveTab(tab);
        setSelectedId(null);
      } else if (parts.length === 2) {
        const tab = parts[0];
        const id = parts[1];
        setActiveTab(tab);
        setSelectedId(id);
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cons, projs, asts, vends, acts] = await Promise.all([
        dbService.getAccounts(),
        dbService.getContacts(),
        dbService.getProjects(),
        dbService.getAssets(),
        dbService.getVendors(),
        dbService.getActivities()
      ]);
      setAccounts(accs);
      setContacts(cons);
      setProjects(projs);
      setAssets(asts);
      setVendors(vends);
      setActivities(acts);
    } catch (e) {
      console.error("Error loading CRM data", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle addition of records
  const handleAddAccount = async (newAcc: Omit<Account, 'id' | 'createdAt'>) => {
    const added = await dbService.addAccount(newAcc);
    setAccounts(prev => [...prev, added]);
  };

  const handleAddContact = async (newCon: Omit<Contact, 'id' | 'createdAt'>) => {
    const added = await dbService.addContact(newCon);
    setContacts(prev => [...prev, added]);
  };

  const handleAddProject = async (newProj: Omit<Project, 'id' | 'createdAt'>) => {
    const added = await dbService.addProject(newProj);
    setProjects(prev => [...prev, added]);
  };

  const handleAddAsset = async (newAsset: Omit<Asset, 'id' | 'createdAt'>) => {
    const added = await dbService.addAsset(newAsset);
    setAssets(prev => [...prev, added]);
  };

  const handleAddVendor = async (newVend: Omit<Vendor, 'id' | 'createdAt'>) => {
    const added = await dbService.addVendor(newVend);
    setVendors(prev => [...prev, added]);
  };

  const handleAddActivity = async (newAct: Omit<Activity, 'id' | 'timestamp'>) => {
    const added = await dbService.addActivity(newAct);
    setActivities(prev => [...prev, added]);
  };

  // Handle updates of records
  const handleUpdateAccount = async (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => {
    await dbService.updateAccount(id, updates);
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleUpdateContact = async (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>) => {
    await dbService.updateContact(id, updates);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleUpdateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    await dbService.updateProject(id, updates);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleUpdateAsset = async (id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>) => {
    await dbService.updateAsset(id, updates);
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleUpdateVendor = async (id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => {
    await dbService.updateVendor(id, updates);
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('dashboard');
  };

  if (loadingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-fog)',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-sf-pro-text)',
        fontSize: 'var(--text-body)'
      }}>
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return <SignIn onAuthSuccess={() => fetchData()} />;
  }

  // Navigation tabs config
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'accounts', label: 'Accounts', icon: <Users size={18} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit size={18} /> },
    { id: 'assets', label: 'Assets', icon: <HardDrive size={18} /> },
    { id: 'vendors', label: 'Vendors', icon: <Handshake size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileBarChart2 size={18} /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            accounts={accounts} 
            contacts={contacts} 
            projects={projects} 
            assets={assets} 
            vendors={vendors}
            activities={activities}
            setActiveTab={(tab) => navigate(tab)}
          />
        );
      case 'accounts':
        return (
          <AccountsTab 
            accounts={accounts} 
            contacts={contacts}
            projects={projects}
            assets={assets}
            activities={activities}
            onAddAccount={handleAddAccount} 
            onUpdateAccount={handleUpdateAccount}
            onAddActivity={handleAddActivity}
            selectedAccountId={selectedId}
            onNavigate={navigate}
          />
        );
      case 'contacts':
        return (
          <ContactsTab 
            contacts={contacts} 
            accounts={accounts} 
            activities={activities}
            onAddContact={handleAddContact} 
            onUpdateContact={handleUpdateContact}
            onAddActivity={handleAddActivity}
            selectedContactId={selectedId}
            onNavigate={navigate}
          />
        );
      case 'projects':
        return (
          <ProjectsTab 
            projects={projects} 
            accounts={accounts} 
            contacts={contacts} 
            onAddProject={handleAddProject} 
            onUpdateProject={handleUpdateProject}
            selectedProjectId={selectedId}
            onNavigate={navigate}
          />
        );
      case 'assets':
        return (
          <AssetsTab 
            assets={assets} 
            accounts={accounts} 
            onAddAsset={handleAddAsset} 
            onUpdateAsset={handleUpdateAsset}
            selectedAssetId={selectedId}
            onNavigate={navigate}
          />
        );
      case 'vendors':
        return (
          <VendorsTab 
            vendors={vendors} 
            onAddVendor={handleAddVendor} 
            onUpdateVendor={handleUpdateVendor}
            selectedVendorId={selectedId}
            onNavigate={navigate}
          />
        );
      case 'reports':
        return (
          <ReportsTab 
            accounts={accounts} 
            contacts={contacts} 
            projects={projects} 
            assets={assets} 
            activities={activities}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', background: 'var(--color-fog)' }}>
      {/* Top Header Navigation */}
      <header className="no-print" style={{
        background: 'rgba(245, 245, 247, 0.86)',
        borderBottom: '1px solid var(--color-silver-mist)',
        padding: '8px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Brand/Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('dashboard')}>
          <img 
            src="/logo.png" 
            alt="Workflow Zero Logo" 
            style={{ height: '30px', objectFit: 'contain' }}
          />
          <span style={{
            fontFamily: 'var(--font-aeonikpro)',
            fontSize: 'var(--text-body)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            letterSpacing: 'var(--tracking-body)'
          }}>
            CRM
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-only">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary-outline"
                style={{
                  padding: '6px 14px',
                  fontSize: 'var(--text-caption)',
                  background: isActive ? 'rgba(210, 210, 215, 0.64)' : 'transparent',
                  border: '1px solid transparent',
                  color: 'var(--color-ink)',
                  borderRadius: 'var(--radius-full)',
                  backdropFilter: isActive ? 'blur(20px)' : 'none'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-caption)' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--color-snow)',
              border: '1px solid var(--color-silver-mist)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink)'
            }}>
              <UserIcon size={14} />
            </div>
            <span style={{ color: 'var(--color-graphite)' }}>
              {user.displayName || user.email}
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="btn-icon" 
            title="Sign Out"
            style={{ width: '32px', height: '32px' }}
          >
            <LogOut size={14} />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="btn-icon mobile-only" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ width: '36px', height: '36px' }}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="no-print mobile-only" style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.96)',
          borderBottom: '1px solid var(--color-silver-mist)',
          padding: '16px',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backdropFilter: 'blur(20px)'
        }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="btn-secondary-outline"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 16px',
                  fontSize: 'var(--text-body)',
                  background: isActive ? 'rgba(210, 210, 215, 0.64)' : 'transparent',
                  borderColor: 'transparent',
                  color: 'var(--color-ink)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            borderTop: '1px solid var(--color-silver-mist)',
            paddingTop: '16px',
            fontSize: 'var(--text-caption)'
          }}>
            <span style={{ color: 'var(--color-graphite)' }}>
              Logged in: {user.displayName || user.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="btn-secondary-outline"
              style={{ padding: '6px 12px', fontSize: 'var(--text-caption)' }}
            >
              <LogOut size={12} style={{ marginRight: '4px' }} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{
        flexGrow: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '44px 24px 64px',
        zIndex: 10
      }}>
        {renderActiveTab()}
      </main>

      {/* Styling for Responsive Layouts */}
      <style>{`
        .desktop-only {
          display: flex;
        }
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
