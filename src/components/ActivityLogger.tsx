import React, { useState, useEffect } from 'react';
import { Contact, Activity } from '../types';
import { authService } from '../firebase';
import { Mail, Phone, MessageSquare, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface ActivityLoggerProps {
  accountId: string;
  contacts: Contact[];
  preselectedContactId?: string; // Optional pre-selected contact ID (if logged from contact page)
  defaultPhone?: string;
  defaultEmail?: string;
  onAddActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>;
}

type TabType = 'email' | 'call' | 'text';

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  accountId,
  contacts,
  preselectedContactId,
  defaultPhone = '',
  defaultEmail = '',
  onAddActivity
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  
  // Input fields
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('5'); // Default 5 minutes for call
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync pre-selected contact ID
  useEffect(() => {
    if (preselectedContactId) {
      setSelectedContactId(preselectedContactId);
    }
  }, [preselectedContactId]);

  // Autofill details based on contact selection
  useEffect(() => {
    if (selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
        setPhoneNumber(contact.phone || '');
        setEmailAddress(contact.email || '');
      }
    } else {
      setPhoneNumber(defaultPhone);
      setEmailAddress(defaultEmail);
    }
  }, [selectedContactId, contacts, defaultPhone, defaultEmail]);

  // Reset tab-specific fields when tab changes
  useEffect(() => {
    setError(null);
    setSubject('');
    setContent('');
    // Set default subjects
    if (activeTab === 'email') {
      setSubject('Email Correspondence');
    } else if (activeTab === 'call') {
      setSubject('Phone Call Follow-up');
    } else if (activeTab === 'text') {
      setSubject('SMS Correspondence');
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a subject/purpose for this interaction.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide notes or content details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const currentUser = authService.getCurrentUser();
      const creatorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'CRM Operator';

      const metadata: Record<string, any> = {};
      if (activeTab === 'call') {
        metadata.duration = parseInt(duration) || 0;
        metadata.phoneNumber = phoneNumber;
      } else if (activeTab === 'text') {
        metadata.phoneNumber = phoneNumber;
      } else if (activeTab === 'email') {
        metadata.emailAddress = emailAddress;
      }

      await onAddActivity({
        type: activeTab,
        direction,
        accountId,
        contactId: selectedContactId || undefined,
        subject: subject.trim(),
        content: content.trim(),
        creatorName,
        metadata
      });

      // Clear input fields (except prefilled meta contact details)
      setContent('');
      if (activeTab === 'email') {
        setSubject('Email Correspondence');
      } else if (activeTab === 'call') {
        setSubject('Phone Call Follow-up');
      } else if (activeTab === 'text') {
        setSubject('SMS Correspondence');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to log interaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'email', label: 'Email', icon: <Mail size={14} /> },
    { id: 'call', label: 'Phone Call', icon: <Phone size={14} /> },
    { id: 'text', label: 'Text Message', icon: <MessageSquare size={14} /> }
  ];

  return (
    <div className="glassy-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <span className="status-badge" style={{ textTransform: 'uppercase', fontSize: '9px', width: 'fit-content' }}>
        Activity logging engine
      </span>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-silver-mist)',
        paddingBottom: '2px',
        gap: '4px'
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: isActive ? 'rgba(210, 210, 215, 0.4)' : 'transparent',
                border: 'none',
                color: isActive ? 'var(--color-ghost-white)' : 'var(--color-whisper-blue)',
                cursor: 'pointer',
                fontSize: 'var(--text-caption)',
                fontWeight: isActive ? 600 : 500,
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            color: 'var(--color-caution)',
            fontSize: 'var(--text-caption)',
            alignItems: 'center'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Direction toggle & Contact selection row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {/* Direction toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>Direction</label>
            <div style={{ display: 'flex', background: 'var(--color-fog)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--color-silver-mist)' }}>
              <button
                type="button"
                onClick={() => setDirection('outbound')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px',
                  background: direction === 'outbound' ? 'rgba(36, 138, 61, 0.12)' : 'transparent',
                  border: 'none',
                  color: direction === 'outbound' ? '#248a3d' : 'var(--color-whisper-blue)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: direction === 'outbound' ? 600 : 400
                }}
              >
                <ArrowUpRight size={12} /> Outbound
              </button>
              <button
                type="button"
                onClick={() => setDirection('inbound')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px',
                  background: direction === 'inbound' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  border: 'none',
                  color: direction === 'inbound' ? 'var(--color-caution)' : 'var(--color-whisper-blue)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: direction === 'inbound' ? 600 : 400
                }}
              >
                <ArrowDownLeft size={12} /> Inbound
              </button>
            </div>
          </div>

          {/* Contact selector */}
          {!preselectedContactId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>Associate Contact</label>
              <select
                className="input-minimal"
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                style={{ padding: '8px' }}
              >
                <option value="">-- General Account Log --</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} ({contact.jobTitle || 'No Title'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab-specific details prefill row */}
        {activeTab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>
              {direction === 'outbound' ? 'Recipient Email Address' : 'Sender Email Address'}
            </label>
            <input
              type="email"
              className="input-minimal"
              placeholder="e.g. client@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'call' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>Phone Number</label>
              <input
                type="text"
                className="input-minimal"
                placeholder="e.g. +1 555 0101"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>Duration (min)</label>
              <input
                type="number"
                className="input-minimal"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>Mobile Phone Number</label>
            <input
              type="text"
              className="input-minimal"
              placeholder="e.g. +1 555 0101"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        )}

        {/* Subject line */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>
            {activeTab === 'email' ? 'Subject' : activeTab === 'call' ? 'Call Purpose' : 'Topic'}
          </label>
          <input
            type="text"
            className="input-minimal"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        {/* Content body/notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--color-arctic-mist)' }}>
            {activeTab === 'email' ? 'Email Body/Correspondence Notes' : activeTab === 'call' ? 'Call Discussion Summary' : 'Text Content / SMS Notes'}
          </label>
          <textarea
            className="input-minimal"
            rows={3}
            placeholder={activeTab === 'email' ? 'Enter email text or key correspondence points...' : activeTab === 'call' ? 'Enter notes about what was discussed and outcome...' : 'Enter SMS content details...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-solid-primary"
          disabled={submitting}
          style={{
            alignSelf: 'flex-end',
            borderRadius: 'var(--radius-md)',
            padding: '8px 24px',
            fontSize: 'var(--text-body)',
            width: '100%',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {submitting ? 'Logging Interaction...' : `Log ${activeTab === 'email' ? 'Email' : activeTab === 'call' ? 'Phone Call' : 'Text Message'}`}
        </button>
      </form>
    </div>
  );
};
