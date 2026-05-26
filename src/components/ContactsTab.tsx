import React, { useState, useMemo } from 'react';
import { Contact, Account } from '../types';
import { Plus, Search, Filter, Mail, Phone, Briefcase, Building } from 'lucide-react';

interface ContactsTabProps {
  contacts: Contact[];
  accounts: Account[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({ contacts, accounts, onAddContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAccount = accountFilter === 'ALL' || contact.accountId === accountFilter;

      return matchesSearch && matchesAccount;
    });
  }, [contacts, searchTerm, accountFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !accountId) return;
    setSubmitting(true);
    try {
      await onAddContact({
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        accountId
      });
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setAccountId('');
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
            Contacts Directory
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Manage communication records and client relationships.
          </p>
        </div>
        <button className="btn-primary-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add Contact</span>
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
            placeholder="Search contacts by name, title, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Account Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--color-whisper-blue)' }} />
          <select
            className="input-minimal"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            style={{ width: '200px', padding: '8px 10px' }}
          >
            <option value="ALL">All Clients</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => {
            const linkedAccount = accounts.find(a => a.id === contact.accountId);
            return (
              <div key={contact.id} className="glassy-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px'
              }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-ghost-white)' }}>
                    {contact.firstName} {contact.lastName}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-arctic-mist)',
                    marginTop: '4px'
                  }}>
                    <Briefcase size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                    <span>{contact.jobTitle || 'No Title'}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(5, 6, 15, 0.4)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(186, 215, 247, 0.04)',
                  fontSize: 'var(--text-caption)'
                }}>
                  <Building size={14} style={{ color: 'var(--color-celestial-light)' }} />
                  <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>
                    {linkedAccount?.name || 'Unknown Account'}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  fontSize: 'var(--text-caption)',
                  borderTop: '1px solid rgba(186, 215, 247, 0.04)',
                  paddingTop: '10px',
                  marginTop: '4px'
                }}>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-comet)' }}>
                      <Mail size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                      <span>{contact.email}</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-comet)' }}>
                      <Phone size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-whisper-blue)' }}>
            No contacts match the selected filters.
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
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
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Add New Contact Record</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>First Name*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Last Name*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Linked Account*</label>
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
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Job Title</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Chief Technology Officer"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Email Address</label>
                <input
                  type="email"
                  className="input-minimal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@acme.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Phone Number</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0101"
                />
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
                  {submitting ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
