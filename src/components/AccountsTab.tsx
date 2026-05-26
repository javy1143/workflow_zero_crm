import React, { useState, useMemo, useRef } from 'react';
import { Account, Contact, Project, Asset } from '../types';
import { Plus, Search, Filter, Globe, Phone, Mail, MapPin, Edit3, X, FileText, Upload, Trash2, Paperclip, Briefcase, FolderGit, HardDrive, Users } from 'lucide-react';

interface AccountsTabProps {
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  assets: Asset[];
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ 
  accounts, 
  contacts,
  projects,
  assets,
  onAddAccount,
  onUpdateAccount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Account form states
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Lead' | 'Inactive'>('Active');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Account form states (for selected account)
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Lead' | 'Inactive'>('Active');
  const [editIndustry, setEditIndustry] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [updating, setUpdating] = useState(false);

  // Get unique industries for filter dropdown
  const industries = useMemo(() => {
    const list = accounts.map(a => a.industry).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.website.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || account.status === statusFilter;
      const matchesIndustry = industryFilter === 'ALL' || account.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [accounts, searchTerm, statusFilter, industryFilter]);

  // Subsections for selected account
  const accountContacts = useMemo(() => {
    if (!selectedAccount) return [];
    return contacts.filter(c => c.accountId === selectedAccount.id);
  }, [selectedAccount, contacts]);

  const accountProjects = useMemo(() => {
    if (!selectedAccount) return [];
    return projects.filter(p => p.accountId === selectedAccount.id);
  }, [selectedAccount, projects]);

  const accountAssets = useMemo(() => {
    if (!selectedAccount) return [];
    return assets.filter(a => a.accountId === selectedAccount.id);
  }, [selectedAccount, assets]);

  // Open Details Modal and fill edit state
  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setEditName(account.name);
    setEditStatus(account.status);
    setEditIndustry(account.industry);
    setEditWebsite(account.website);
    setEditPhone(account.phone);
    setEditEmail(account.email);
    setEditStreet(account.street);
    setEditCity(account.city);
    setEditState(account.state);
    setEditPostalCode(account.postalCode);
    setEditMode(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      await onAddAccount({
        name,
        status,
        industry,
        website,
        phone,
        email,
        street,
        city,
        state,
        postalCode,
        documents: []
      });
      // Clear form
      setName('');
      setStatus('Active');
      setIndustry('');
      setWebsite('');
      setPhone('');
      setEmail('');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !editName) return;
    setUpdating(true);
    try {
      const updates = {
        name: editName,
        status: editStatus,
        industry: editIndustry,
        website: editWebsite,
        phone: editPhone,
        email: editEmail,
        street: editStreet,
        city: editCity,
        state: editState,
        postalCode: editPostalCode
      };
      await onUpdateAccount(selectedAccount.id, updates);
      
      // Update selected account state locally to reflect edits
      setSelectedAccount(prev => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Document attachments handlers
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!selectedAccount || !file) return;

    // Format file size
    let sizeStr = '0 KB';
    if (file.size >= 1024 * 1024) {
      sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      sizeStr = Math.round(file.size / 1024) + ' KB';
    }

    const newDoc = {
      id: 'doc-' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: sizeStr,
      uploadedAt: new Date().toLocaleDateString()
    };

    const currentDocs = selectedAccount.documents || [];
    const updatedDocs = [...currentDocs, newDoc];

    try {
      await onUpdateAccount(selectedAccount.id, { documents: updatedDocs });
      setSelectedAccount(prev => prev ? { ...prev, documents: updatedDocs } : null);
      
      // Clear file input value
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Error uploading document", err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedAccount) return;
    
    const currentDocs = selectedAccount.documents || [];
    const updatedDocs = currentDocs.filter(d => d.id !== docId);

    try {
      await onUpdateAccount(selectedAccount.id, { documents: updatedDocs });
      setSelectedAccount(prev => prev ? { ...prev, documents: updatedDocs } : null);
    } catch (err) {
      console.error("Error removing document", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Client Directory
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            List of all client accounts. Click on any client to view details, make updates, and upload documentation.
          </p>
        </div>
        <button className="btn-primary-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add Account</span>
        </button>
      </div>

      {/* Filter Control Board */}
      <div className="glassy-card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        padding: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-whisper-blue)'
          }} />
          <input
            type="text"
            className="input-minimal"
            placeholder="Search accounts by name, city, website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--color-whisper-blue)' }} />
          <select
            className="input-minimal"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '130px', padding: '8px 10px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Industry Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="input-minimal"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{ width: '160px', padding: '8px 10px' }}
          >
            <option value="ALL">All Industries</option>
            {industries.filter(ind => ind !== 'ALL').map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="table-container">
        {filteredAccounts.length > 0 ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Status</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Contact Info</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => (
                <tr 
                  key={account.id} 
                  className="clickable-row" 
                  onClick={() => handleSelectAccount(account)}
                >
                  <td style={{ fontWeight: 500, color: 'var(--color-ghost-white)' }}>
                    {account.name}
                  </td>
                  <td>
                    <span className={`status-badge ${account.status.toLowerCase()}`}>
                      {account.status}
                    </span>
                  </td>
                  <td>{account.industry || '—'}</td>
                  <td>
                    {account.city && account.state ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-caption)' }}>
                        <MapPin size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                        {account.city}, {account.state}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-caption)' }}>
                      {account.phone && (
                        <span>{account.phone}</span>
                      )}
                      {account.email && (
                        <span style={{ color: 'var(--color-whisper-blue)' }}>{account.email}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {account.website ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', color: 'var(--color-celestial-light)' }}>
                        <Globe size={12} />
                        {account.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-whisper-blue)' }}>
            No accounts match the selected filters.
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 6, 15, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="login-card" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Add New Client Account</h3>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Account Name*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Status</label>
                  <select
                    className="input-minimal"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Industry</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology, Biotech"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Website</label>
                  <input
                    type="url"
                    className="input-minimal"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Phone</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-0100"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Email</label>
                  <input
                    type="email"
                    className="input-minimal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@example.com"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Street Address</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>City</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>State</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Postal Code</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="94107"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="btn-secondary-outline" 
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-solid-primary" 
                  disabled={submitting}
                  style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontSize: 'var(--text-body)' }}
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Details & Document Upload & Editor Modal */}
      {selectedAccount && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 6, 15, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="login-card" style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAccount(null)}
              className="btn-icon"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '40px' }}>
              <div>
                <span className="status-badge" style={{ textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px' }}>
                  Client Console / Details
                </span>
                <h3 style={{ fontSize: 'var(--text-heading-lg)', color: 'var(--color-ghost-white)', fontFamily: 'var(--font-aeonikpro)' }}>
                  {selectedAccount.name}
                </h3>
              </div>
              <button 
                className="btn-primary-pill" 
                onClick={() => setEditMode(!editMode)}
                style={{ fontSize: 'var(--text-caption)', padding: '6px 14px' }}
              >
                <Edit3 size={12} />
                <span>{editMode ? 'Cancel Edit' : 'Edit Info'}</span>
              </button>
            </div>

            {editMode ? (
              /* EDITOR FORM */
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Account Name*</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Status</label>
                    <select
                      className="input-minimal"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                    >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Industry</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editIndustry}
                      onChange={(e) => setEditIndustry(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Website</label>
                    <input
                      type="url"
                      className="input-minimal"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Phone</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Email</label>
                    <input
                      type="email"
                      className="input-minimal"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Street Address</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>City</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>State</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Postal Code</label>
                    <input
                      type="text"
                      className="input-minimal"
                      value={editPostalCode}
                      onChange={(e) => setEditPostalCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary-outline" 
                    onClick={() => setEditMode(false)}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-solid-primary" 
                    disabled={updating}
                    style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontSize: 'var(--text-body)' }}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* DETAILS VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Meta details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Status & Industry</span>
                    <div>
                      <span className={`status-badge ${selectedAccount.status.toLowerCase()}`} style={{ marginRight: '8px' }}>
                        {selectedAccount.status}
                      </span>
                      <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-ghost-white)' }}>
                        {selectedAccount.industry || 'No Industry'}
                      </span>
                    </div>
                  </div>

                  <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Contact Info</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-caption)' }}>
                      {selectedAccount.phone && <span><strong>Phone:</strong> {selectedAccount.phone}</span>}
                      {selectedAccount.email && <span><strong>Email:</strong> {selectedAccount.email}</span>}
                      {selectedAccount.website && (
                        <a href={selectedAccount.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-celestial-light)', textDecoration: 'underline' }}>
                          {selectedAccount.website}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Office Address</span>
                    <div style={{ fontSize: 'var(--text-caption)' }}>
                      {selectedAccount.street ? (
                        <>
                          {selectedAccount.street}<br />
                          {selectedAccount.city}, {selectedAccount.state} {selectedAccount.postalCode}
                        </>
                      ) : 'No address on file.'}
                    </div>
                  </div>
                </div>

                {/* Subsections Grid: Contacts, Projects, Assets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                  {/* Left: Contacts and Systems */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Contacts */}
                    <div className="glassy-card" style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} style={{ color: 'var(--color-celestial-light)' }} />
                        <span>Associated Contacts ({accountContacts.length})</span>
                      </h4>
                      {accountContacts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {accountContacts.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', borderBottom: '1px solid rgba(186, 215, 247, 0.04)', paddingBottom: '6px' }}>
                              <div>
                                <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
                                <span style={{ color: 'var(--color-whisper-blue)', marginLeft: '6px' }}>— {c.jobTitle}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '10px', color: 'var(--color-whisper-blue)' }}>
                                {c.email && <span>{c.email}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>No contacts linked to this account.</span>
                      )}
                    </div>

                    {/* Systems / Assets */}
                    <div className="glassy-card" style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HardDrive size={16} style={{ color: 'var(--color-arctic-mist)' }} />
                        <span>Account Assets & Systems ({accountAssets.length})</span>
                      </h4>
                      {accountAssets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {accountAssets.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-caption)' }}>
                              <div>
                                <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>{a.name}</span>
                                <span className="status-badge" style={{ fontSize: '8px', padding: '1px 4px', marginLeft: '6px' }}>{a.serviceProvider}</span>
                              </div>
                              <span style={{ color: a.status === 'Active' ? '#34d399' : '#fbce4a' }}>{a.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>No systems associated.</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Projects and Supporting Documentation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Projects */}
                    <div className="glassy-card" style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderGit size={16} style={{ color: 'var(--color-neon-violet)' }} />
                        <span>Ongoing Projects ({accountProjects.length})</span>
                      </h4>
                      {accountProjects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {accountProjects.map(p => (
                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(186, 215, 247, 0.04)', paddingBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)' }}>
                                <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>{p.name}</span>
                                <span className={`status-badge ${p.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '2px 4px' }}>
                                  {p.status}
                                </span>
                              </div>
                              {/* Progress mini bar */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <div style={{ flexGrow: 1, height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${p.percentageComplete}%`, height: '100%', background: 'var(--color-neon-violet)' }} />
                                </div>
                                <span style={{ fontFamily: 'var(--font-dotdigital)', fontSize: '10px' }}>{p.percentageComplete}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>No projects in portfolio.</span>
                      )}
                    </div>

                    {/* Supporting Documentation / Document Attachment Manager */}
                    <div className="glassy-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Paperclip size={16} style={{ color: 'var(--color-celestial-light)' }} />
                          <span>Supporting Documentation</span>
                        </h4>
                        
                        {/* Hidden File Input */}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileUpload}
                        />
                        <button 
                          className="btn-primary-pill" 
                          onClick={handleTriggerUpload}
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          <Upload size={11} />
                          <span>Attach File</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedAccount.documents && selectedAccount.documents.length > 0 ? (
                          selectedAccount.documents.map(doc => (
                            <div 
                              key={doc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(5, 6, 15, 0.5)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(186, 215, 247, 0.05)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={16} style={{ color: 'var(--color-whisper-blue)' }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ 
                                    fontSize: 'var(--text-caption)', 
                                    color: 'var(--color-ghost-white)', 
                                    fontWeight: 500,
                                    wordBreak: 'break-all',
                                    paddingRight: '12px'
                                  }}>
                                    {doc.name}
                                  </span>
                                  <span style={{ fontSize: '9px', color: 'var(--color-whisper-blue)' }}>
                                    Size: {doc.size} &bull; Uploaded: {doc.uploadedAt}
                                  </span>
                                </div>
                              </div>

                              <button 
                                onClick={() => handleDeleteDocument(doc.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#f87171',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                title="Remove document"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '20px 0',
                            border: '1px dashed rgba(186, 215, 247, 0.12)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-whisper-blue)',
                            fontSize: 'var(--text-caption)'
                          }}>
                            <FileText size={24} style={{ color: 'rgba(186, 215, 247, 0.1)' }} />
                            <span>No documentation uploaded for this client yet.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
