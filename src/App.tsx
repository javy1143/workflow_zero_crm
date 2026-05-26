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
import { Account, Contact, Project, Asset, Vendor } from './types';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // CRM Data States
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch CRM data when logged in
  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cons, projs, asts, vends] = await Promise.all([
        dbService.getAccounts(),
        dbService.getContacts(),
        dbService.getProjects(),
        dbService.getAssets(),
        dbService.getVendors()
      ]);
      setAccounts(accs);
      setContacts(cons);
      setProjects(projs);
      setAssets(asts);
      setVendors(vends);
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

  const handleSignOut = async () => {
    await authService.signOut();
    setActiveTab('dashboard');
  };

  if (loadingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-midnight-abyss)',
        color: 'var(--color-ghost-white)',
        fontFamily: 'var(--font-dotdigital)',
        fontSize: 'var(--text-body-lg)'
      }}>
        LOADING COMMAND CENTER SYSTEM...
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
            setActiveTab={setActiveTab}
          />
        );
      case 'accounts':
        return <AccountsTab accounts={accounts} onAddAccount={handleAddAccount} />;
      case 'contacts':
        return <ContactsTab contacts={contacts} accounts={accounts} onAddContact={handleAddContact} />;
      case 'projects':
        return <ProjectsTab projects={projects} accounts={accounts} contacts={contacts} onAddProject={handleAddProject} />;
      case 'assets':
        return <AssetsTab assets={assets} accounts={accounts} onAddAsset={handleAddAsset} />;
      case 'vendors':
        return <VendorsTab vendors={vendors} onAddVendor={handleAddVendor} />;
      case 'reports':
        return <ReportsTab accounts={accounts} contacts={contacts} projects={projects} assets={assets} />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <header className="no-print" style={{
        background: 'rgba(5, 6, 15, 0.95)',
        borderBottom: '1px solid rgba(186, 215, 247, 0.08)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Brand/Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <img 
            src="/logo.png" 
            alt="Workflow Zero Logo" 
            style={{ height: '30px', objectFit: 'contain' }}
          />
          <span style={{
            fontFamily: 'var(--font-aeonikpro)',
            fontSize: 'var(--text-body-lg)',
            fontWeight: 500,
            color: 'var(--color-ghost-white)',
            letterSpacing: '0.05em'
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
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={isActive ? 'btn-primary-pill' : 'btn-secondary-outline'}
                style={{
                  padding: '6px 14px',
                  fontSize: 'var(--text-caption)',
                  background: isActive ? 'rgba(186, 214, 247, 0.06)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  color: isActive ? 'var(--color-ghost-white)' : 'var(--color-comet)',
                  borderRadius: 'var(--radius-full)'
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
              background: 'var(--color-storm-gray)',
              border: '1px solid rgba(186, 215, 247, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ghost-white)'
            }}>
              <UserIcon size={14} />
            </div>
            <span style={{ color: 'var(--color-arctic-mist)' }}>
              {user.displayName || user.email}
            </span>
            {authService.isDemo() && (
              <span className="status-badge" style={{ fontSize: '9px', padding: '2px 6px', color: '#fbce4a', borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                DEMO
              </span>
            )}
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
          background: 'rgba(5, 6, 15, 0.98)',
          borderBottom: '1px solid rgba(186, 215, 247, 0.12)',
          padding: '16px',
          zIndex: 49,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={isActive ? 'btn-primary-pill' : 'btn-secondary-outline'}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 16px',
                  fontSize: 'var(--text-body)',
                  background: isActive ? 'rgba(186, 214, 247, 0.08)' : 'transparent',
                  borderColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: isActive ? 'var(--color-ghost-white)' : 'var(--color-comet)',
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
            borderTop: '1px solid rgba(186, 215, 247, 0.08)',
            paddingTop: '16px',
            fontSize: 'var(--text-caption)'
          }}>
            <span style={{ color: 'var(--color-whisper-blue)' }}>
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
        padding: '32px 24px',
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
