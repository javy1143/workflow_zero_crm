import React, { useState, useMemo, useEffect } from 'react';
import { Contact, Account, Activity } from '../types';
import { Plus, Search, Filter, Mail, Phone, Briefcase, Building, Edit3, Home, ChevronRight, ArrowLeft } from 'lucide-react';
import { ActivityLogger } from './ActivityLogger';
import { ActivityTimeline } from './ActivityTimeline';

interface ContactsTabProps {
  contacts: Contact[];
  accounts: Account[];
  activities: Activity[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateContact: (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>) => Promise<void>;
  onAddActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>;
  selectedContactId?: string | null;
  onNavigate: (tab: string, id?: string) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({ 
  contacts, 
  accounts, 
  activities,
  onAddContact,
  onUpdateContact,
  onAddActivity,
  selectedContactId,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Add Contact form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Contact form states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [updating, setUpdating] = useState(false);

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

  // Sync selectedContactId from URL
  useEffect(() => {
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
        setSelectedContact(contact);
        setEditFirstName(contact.firstName);
        setEditLastName(contact.lastName);
        setEditEmail(contact.email);
        setEditPhone(contact.phone);
        setEditJobTitle(contact.jobTitle);
        setEditAccountId(contact.accountId);
      } else {
        setSelectedContact(null);
      }
      setEditMode(false);
    } else {
      setSelectedContact(null);
      setEditMode(false);
    }
  }, [selectedContactId, contacts]);

  const contactActivities = useMemo(() => {
    if (!selectedContact) return [];
    return activities
      .filter(act => act.contactId === selectedContact.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedContact, activities]);

  const handleSelectContact = (contact: Contact) => {
    onNavigate('contacts', contact.id);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !editFirstName || !editLastName || !editAccountId) return;
    setUpdating(true);
    try {
      await onUpdateContact(selectedContact.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        jobTitle: editJobTitle,
        accountId: editAccountId
      });
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (selectedContactId) {
    if (!selectedContact) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-ghost-white)' }}>Contact Record not found</h3>
          <button className="btn-secondary-outline" onClick={() => onNavigate('contacts')} style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Contacts Directory
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-graphite)',
          paddingBottom: '8px'
        }}>
          <span 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} 
            onClick={() => onNavigate('dashboard')}
          >
            <Home size={14} />
          </span>
          <ChevronRight size={12} />
          <span 
            style={{ cursor: 'pointer' }} 
            onClick={() => onNavigate('contacts')}
          >
            contacts
          </span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
            {selectedContact.id}
          </span>
        </div>

        {/* Details page container */}
        <div className="login-card" style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}>
          {/* Back button */}
          <button 
            onClick={() => onNavigate('contacts')}
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 10
            }}
            title="Back to List"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '40px' }}>
            <div>
              <span className="status-badge" style={{ textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px' }}>
                Contact Console / Details
              </span>
              <h3 style={{ fontSize: 'var(--text-heading-lg)', color: 'var(--color-ghost-white)', fontFamily: 'var(--font-aeonikpro)' }}>
                {selectedContact.firstName} {selectedContact.lastName}
              </h3>
            </div>
            <button 
              className="btn-primary-pill" 
              onClick={() => setEditMode(!editMode)}
              style={{ fontSize: 'var(--text-caption)', padding: '6px 14px' }}
            >
              <Edit3 size={12} />
              <span>{editMode ? 'Cancel Edit' : 'Edit Contact'}</span>
            </button>
          </div>

          {editMode ? (
            /* EDITOR FORM */
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>First Name*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Last Name*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Linked Account*</label>
                <select
                  className="input-minimal"
                  value={editAccountId}
                  onChange={(e) => setEditAccountId(e.target.value)}
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
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Email Address</label>
                <input
                  type="email"
                  className="input-minimal"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Phone Number</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
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
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Job Profile</span>
                  <div style={{ fontSize: 'var(--text-body)', color: 'var(--color-ghost-white)', fontWeight: 500 }}>
                    {selectedContact.jobTitle || 'No Title'}
                  </div>
                </div>

                <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Linked Client Account</span>
                  <div 
                    onClick={() => {
                      const acc = accounts.find(a => a.id === selectedContact.accountId);
                      if (acc) onNavigate('accounts', acc.id);
                    }}
                    style={{ 
                      fontSize: 'var(--text-body)', 
                      color: 'var(--color-celestial-light)', 
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {accounts.find(a => a.id === selectedContact.accountId)?.name || 'Unknown Account'}
                  </div>
                </div>

                <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Contact Coordinates</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-caption)' }}>
                    {selectedContact.phone && <span><strong>Phone:</strong> {selectedContact.phone}</span>}
                    {selectedContact.email && <span><strong>Email:</strong> {selectedContact.email}</span>}
                  </div>
                </div>
              </div>

              {/* Subsections Grid: Activity Hub (Left) and Client Portfolio Stack (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="details-grid-responsive">
                {/* Left Column: Activity Hub */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <ActivityLogger 
                    accountId={selectedContact.accountId}
                    contacts={[selectedContact]}
                    preselectedContactId={selectedContact.id}
                    defaultPhone={selectedContact.phone}
                    defaultEmail={selectedContact.email}
                    onAddActivity={onAddActivity}
                  />

                  <ActivityTimeline 
                    activities={contactActivities}
                    contacts={contacts}
                  />
                </div>

                {/* Right Column: Account Insights Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glassy-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', borderBottom: '1px solid var(--color-silver-mist)', paddingBottom: '8px' }}>
                      Client Account Details
                    </h4>
                    {(() => {
                      const acc = accounts.find(a => a.id === selectedContact.accountId);
                      if (!acc) return <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>No linked account.</span>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-caption)' }}>
                          <div><strong>Name:</strong> {acc.name}</div>
                          <div><strong>Status:</strong> <span className={`status-badge ${acc.status.toLowerCase()}`}>{acc.status}</span></div>
                          <div><strong>Industry:</strong> {acc.industry || 'N/A'}</div>
                          {acc.website && (
                            <div>
                              <strong>Website: </strong>
                              <a href={acc.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-celestial-light)', textDecoration: 'underline' }}>
                                {acc.website}
                              </a>
                            </div>
                          )}
                          <button 
                            className="btn-secondary-outline"
                            onClick={() => onNavigate('accounts', acc.id)}
                            style={{ padding: '6px 12px', fontSize: '11px', alignSelf: 'flex-start', marginTop: '4px' }}
                          >
                            Go to Client Console
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Contacts Directory
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Click on any contact card below to make updates to job titles, phone numbers, or account linkages.
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
              <div 
                key={contact.id} 
                className="glassy-card clickable-card" 
                onClick={() => handleSelectContact(contact)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '20px',
                  position: 'relative'
                }}
              >
                {/* Visual edit indicator */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-whisper-blue)', opacity: 0.5 }}>
                  <Edit3 size={14} />
                </div>

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
                  background: 'var(--color-fog)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-silver-mist)',
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
                  borderTop: '1px solid var(--color-silver-mist)',
                  paddingTop: '10px',
                  marginTop: '4px'
                }}>
                  {contact.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-comet)' }}>
                      <Mail size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                      <span>{contact.email}</span>
                    </span>
                  )}
                  {contact.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-comet)' }}>
                      <Phone size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                      <span>{contact.phone}</span>
                    </span>
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
          background: 'rgba(29, 29, 31, 0.22)',
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
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
