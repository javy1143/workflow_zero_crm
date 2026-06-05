import React, { useMemo } from 'react';
import { Account, Contact } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface LeanAccountsTabProps {
  accounts: Account[];
  contacts: Contact[];
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const LeanAccountsTab: React.FC<LeanAccountsTabProps> = ({
  accounts,
  contacts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount
}) => {
  const fields = useMemo<FieldConfig<Account>[]>(() => [
    { key: 'name', label: 'Company', required: true, section: 'Basics' },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Basics', options: ['New Lead', 'Contacted', 'Proposal Sent', 'Contract Sent', 'Active Client', 'Paused', 'Lost'] },
    { key: 'health', label: 'Health', type: 'select', section: 'Basics', options: ['Green', 'Yellow', 'Red'] },
    { key: 'industry', label: 'Industry', section: 'Basics' },
    { key: 'serviceInterestedIn', label: 'Service Need', section: 'Basics', placeholder: 'AI email automation, reporting dashboard...' },
    { key: 'primaryContactId', label: 'Primary Contact', type: 'select', section: 'Basics', options: contacts.map(contact => ({ value: contact.id, label: `${contact.firstName} ${contact.lastName}` })) },
    { key: 'website', label: 'Website', type: 'url', section: 'Contact' },
    { key: 'email', label: 'Main Email', type: 'email', section: 'Contact' },
    { key: 'phone', label: 'Main Phone', section: 'Contact' },
    { key: 'timeZone', label: 'Time Zone', section: 'Contact', placeholder: 'America/New_York' },
    { key: 'nextFollowUpDate', label: 'Next Follow-Up', type: 'date', section: 'Next Action' },
    { key: 'nextAction', label: 'Next Action', type: 'textarea', section: 'Next Action' },
    { key: 'monthlyFee', label: 'Monthly Fee', type: 'number', section: 'Simple Billing' },
    { key: 'contractStatus', label: 'Contract Status', type: 'select', section: 'Simple Billing', options: ['Not Started', 'Sent', 'Signed', 'Active', 'Cancelled'] },
    { key: 'renewalDate', label: 'Renewal Date', type: 'date', section: 'Simple Billing' },
    { key: 'painPoints', label: 'Pain Points', type: 'textarea', section: 'Notes' },
    { key: 'internalNotes', label: 'Internal Notes', type: 'textarea', section: 'Notes' }
  ], [contacts]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Accounts', value: accounts.length, tone: 'blue' },
    { label: 'Active Clients', value: accounts.filter(item => ['Active Client', 'Active'].includes(item.status)).length, tone: 'green' },
    { label: 'Needs Follow-Up', value: accounts.filter(item => item.nextFollowUpDate).length, tone: 'cyan' },
    { label: 'Health Flags', value: accounts.filter(item => item.health === 'Yellow' || item.health === 'Red').length, tone: 'red' }
  ], [accounts]);

  return (
    <RecordBoard<Account>
      title="Accounts"
      subtitle="The parent client record: status, health, service need, next action, and simple contract context."
      addLabel="Add Account"
      records={accounts}
      fields={fields}
      defaultRecord={{
        name: '',
        status: 'New Lead',
        health: 'Green',
        industry: '',
        serviceInterestedIn: '',
        primaryContactId: '',
        website: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        timeZone: 'America/New_York',
        nextFollowUpDate: '',
        nextAction: '',
        monthlyFee: 0,
        contractStatus: 'Not Started',
        renewalDate: '',
        painPoints: '',
        internalNotes: '',
        documents: []
      }}
      primaryField="name"
      secondaryFields={['status', 'serviceInterestedIn', 'nextFollowUpDate', 'monthlyFee']}
      badgeField="health"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'primaryContactId') {
          const contact = contacts.find(item => item.id === value);
          return contact ? `${contact.firstName} ${contact.lastName}` : '';
        }
        return '';
      }}
      onAdd={onAddAccount}
      onUpdate={onUpdateAccount}
      onDelete={onDeleteAccount}
    />
  );
};
