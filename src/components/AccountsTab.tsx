import React, { useState, useMemo } from 'react';
import { Account } from '../types';
import { Plus, Search, Filter, Globe, Phone, Mail, MapPin } from 'lucide-react';

interface AccountsTabProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({ accounts, onAddAccount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        postalCode
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Client Directory
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            List of all client accounts, statuses, industries, and addresses.
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
                <tr key={account.id}>
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={11} style={{ color: 'var(--color-whisper-blue)' }} />
                          {account.phone}
                        </span>
                      )}
                      {account.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={11} style={{ color: 'var(--color-whisper-blue)' }} />
                          {account.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {account.website ? (
                      <a 
                        href={account.website} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', color: 'var(--color-celestial-light)' }}
                      >
                        <Globe size={12} />
                        {account.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
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
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              {/* Address details */}
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
    </div>
  );
};
