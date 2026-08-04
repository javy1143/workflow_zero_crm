import React, { useMemo } from 'react';
import { Account, Contact } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface LeanContactsTabProps {
  contacts: Contact[];
  accounts: Account[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateContact: (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
}

export const LeanContactsTab: React.FC<LeanContactsTabProps> = ({
  contacts,
  accounts,
  onAddContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const fields = useMemo<FieldConfig<Contact>[]>(() => [
    { key: 'firstName', label: 'First Name', required: true, section: 'Basics' },
    { key: 'lastName', label: 'Last Name', required: true, section: 'Basics' },
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Basics', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'contactRole', label: 'Role', type: 'select', section: 'Basics', options: ['Owner', 'Decision Maker', 'Billing Contact', 'Technical Contact', 'Day-to-Day Contact'] },
    { key: 'jobTitle', label: 'Job Title', section: 'Basics' },
    { key: 'email', label: 'Email', type: 'email', section: 'Contact' },
    { key: 'phone', label: 'Phone', section: 'Contact' },
    { key: 'preferredContactMethod', label: 'Preferred Method', type: 'select', section: 'Contact', options: ['Email', 'Phone', 'Text', 'Teams', 'Slack'] },
    { key: 'notes', label: 'Notes', type: 'textarea', section: 'Notes' }
  ], [accounts]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Contacts', value: contacts.length, tone: 'blue' },
    { label: 'Decision Makers', value: contacts.filter(item => item.contactRole === 'Decision Maker' || item.contactRole === 'Owner').length, tone: 'green' },
    { label: 'Technical Contacts', value: contacts.filter(item => item.contactRole === 'Technical Contact').length, tone: 'cyan' }
  ], [contacts]);

  return (
    <RecordBoard<Contact>
      title="Contacts"
      subtitle="Only the people you need to contact, invoice, or ask for system access."
      addLabel="Add Contact"
      records={contacts}
      fields={fields}
      defaultRecord={{
        firstName: '',
        lastName: '',
        accountId: '',
        contactRole: 'Day-to-Day Contact',
        jobTitle: '',
        email: '',
        phone: '',
        preferredContactMethod: 'Email',
        notes: ''
      }}
      primaryField="firstName"
      secondaryFields={['lastName', 'accountId', 'contactRole', 'email']}
      badgeField="contactRole"
      filterField="contactRole"
      filterLabel="Roles"
      metrics={metrics}
      getRelatedLabel={(field, value) => field === 'accountId' ? accounts.find(account => account.id === value)?.name || '' : ''}
      onAdd={onAddContact}
      onUpdate={onUpdateContact}
      onDelete={onDeleteContact}
    />
  );
};
