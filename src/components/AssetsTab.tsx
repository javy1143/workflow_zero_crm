import React, { useState, useMemo } from 'react';
import { Asset, Account } from '../types';
import { Plus, Search, Filter, Eye, EyeOff, Key, Code, Cloud, Network, Shield } from 'lucide-react';

interface AssetsTabProps {
  assets: Asset[];
  accounts: Account[];
  onAddAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => Promise<void>;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ assets, accounts, onAddAsset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Track which assets have credential details visible
  const [visibleCredentials, setVisibleCredentials] = useState<Record<string, boolean>>({});

  // Form states
  const [name, setName] = useState('');
  const [serviceProvider, setServiceProvider] = useState<'Make' | 'Google' | 'OpenAI' | 'AWS' | 'Other'>('Make');
  const [details, setDetails] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Deprecated' | 'Testing'>('Active');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toggle credential visibility
  const toggleVisibility = (id: string) => {
    setVisibleCredentials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const linkedAccount = accounts.find(a => a.id === asset.accountId);
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        linkedAccount?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvider = providerFilter === 'ALL' || asset.serviceProvider === providerFilter;
      const matchesAccount = accountFilter === 'ALL' || asset.accountId === accountFilter;
      const matchesStatus = statusFilter === 'ALL' || asset.status === statusFilter;

      return matchesSearch && matchesProvider && matchesAccount && matchesStatus;
    });
  }, [assets, accounts, searchTerm, providerFilter, accountFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !accountId || !details) return;
    setSubmitting(true);
    try {
      await onAddAsset({
        name,
        serviceProvider,
        details,
        accountId,
        status,
        notes
      });
      // Clear form
      setName('');
      setServiceProvider('Make');
      setDetails('');
      setAccountId('');
      setStatus('Active');
      setNotes('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Service provider icons helper
  const renderProviderIcon = (provider: string) => {
    const style = { color: 'var(--color-celestial-light)' };
    switch (provider) {
      case 'Make':
        return <Network size={20} style={style} />;
      case 'Google':
        return <Cloud size={20} style={{ color: '#fbce4a' }} />;
      case 'OpenAI':
        return <Code size={20} style={{ color: '#a78bfa' }} />;
      case 'AWS':
        return <Shield size={20} style={{ color: '#fb923c' }} />;
      default:
        return <Key size={20} style={style} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Account Assets & Integrations
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Systems, OAuth environments, database credentials, and APIs mapped to accounts.
          </p>
        </div>
        <button className="btn-primary-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add Asset</span>
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
            placeholder="Search assets by name, details, client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Provider Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="input-minimal"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{ width: '150px', padding: '8px 10px' }}
          >
            <option value="ALL">All Providers</option>
            <option value="Make">Make.com</option>
            <option value="Google">Google</option>
            <option value="OpenAI">OpenAI</option>
            <option value="AWS">AWS</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Account Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--color-whisper-blue)' }} />
          <select
            className="input-minimal"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            style={{ width: '180px', padding: '8px 10px' }}
          >
            <option value="ALL">All Clients</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="input-minimal"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '130px', padding: '8px 10px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Testing">Testing</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => {
            const linkedAccount = accounts.find(a => a.id === asset.accountId);
            const isCredentialsVisible = !!visibleCredentials[asset.id];
            return (
              <div key={asset.id} className="glassy-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(5, 6, 15, 0.5)', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(186, 215, 247, 0.05)' }}>
                      {renderProviderIcon(asset.serviceProvider)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', fontWeight: 500 }}>
                        {asset.name}
                      </h4>
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>
                        Client: {linkedAccount?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge ${asset.status.toLowerCase()}`}>
                    {asset.status}
                  </span>
                </div>

                {/* Secure Details Box */}
                <div style={{
                  background: 'rgba(5, 6, 15, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(186, 215, 247, 0.08)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)', fontWeight: 500 }}>
                      Credentials & Config
                    </span>
                    <button 
                      onClick={() => toggleVisibility(asset.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-celestial-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px'
                      }}
                    >
                      {isCredentialsVisible ? (
                        <>
                          <EyeOff size={12} />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>Reveal</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ 
                    fontFamily: 'var(--font-dotdigital)', 
                    fontSize: '13px', 
                    color: isCredentialsVisible ? 'var(--color-comet)' : 'var(--color-whisper-blue)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    letterSpacing: isCredentialsVisible ? 'normal' : '0.2em'
                  }}>
                    {isCredentialsVisible ? asset.details : '••••••••••••••••••••••••••••••••••••'}
                  </div>
                </div>

                {asset.notes && (
                  <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>
                    <strong>Notes:</strong> {asset.notes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-whisper-blue)' }}>
            No assets match the selected filters.
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Add System Asset</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Asset Identifier Name*</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Marketing API Workspace"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Service Provider</label>
                  <select
                    className="input-minimal"
                    value={serviceProvider}
                    onChange={(e) => setServiceProvider(e.target.value as any)}
                  >
                    <option value="Make">Make.com</option>
                    <option value="Google">Google Cloud</option>
                    <option value="OpenAI">OpenAI Workspace</option>
                    <option value="AWS">AWS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Asset Status</label>
                  <select
                    className="input-minimal"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Testing">Testing</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Linked Client Account*</label>
                <select
                  className="input-minimal"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                >
                  <option value="">-- Select Client --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Credentials & Configuration details*</label>
                <textarea
                  className="input-minimal"
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="API Key: sk-proj-...&#10;Workspace ID: ws-1234&#10;Console URL: https://..."
                  required
                  style={{ fontFamily: 'var(--font-dotdigital)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Internal Usage Notes</label>
                <textarea
                  className="input-minimal"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional security protocols or documentation links..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
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
                  {submitting ? 'Adding...' : 'Add System Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
