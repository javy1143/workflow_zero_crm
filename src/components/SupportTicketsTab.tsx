import React, { useMemo } from 'react';
import { Account, Automation, Contact, Project, SupportTicket } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface SupportTicketsTabProps {
  supportTickets: SupportTicket[];
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  automations: Automation[];
  onAddSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateSupportTicket: (id: string, updates: Partial<Omit<SupportTicket, 'id' | 'createdAt'>>) => Promise<void>;
}

export const SupportTicketsTab: React.FC<SupportTicketsTabProps> = ({
  supportTickets,
  accounts,
  contacts,
  projects,
  automations,
  onAddSupportTicket,
  onUpdateSupportTicket
}) => {
  const fields = useMemo<FieldConfig<SupportTicket>[]>(() => [
    { key: 'issueTitle', label: 'Issue Title', required: true, section: 'Core Details' },
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Core Details', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'requestedByContactId', label: 'Requested By', type: 'select', section: 'Core Details', options: contacts.map(contact => ({ value: contact.id, label: `${contact.firstName} ${contact.lastName}` })) },
    { key: 'issueType', label: 'Issue Type', type: 'select', required: true, section: 'Core Details', options: ['Automation failed', 'Access issue', 'Vendor issue', 'Enhancement request'] },
    { key: 'priority', label: 'Priority', type: 'select', required: true, section: 'Core Details', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Core Details', options: ['New', 'In Progress', 'Waiting on Client', 'Resolved', 'Closed'] },
    { key: 'automationId', label: 'Related Automation', type: 'select', section: 'Relationships', options: automations.map(automation => ({ value: automation.id, label: automation.name })) },
    { key: 'projectId', label: 'Related Project', type: 'select', section: 'Relationships', options: projects.map(project => ({ value: project.id, label: project.name })) },
    { key: 'description', label: 'Description', type: 'textarea', section: 'Issue Details' },
    { key: 'dateOpened', label: 'Date Opened', type: 'date', required: true, section: 'Issue Details' },
    { key: 'dateResolved', label: 'Date Resolved', type: 'date', section: 'Issue Details' },
    { key: 'rootCause', label: 'Root Cause', type: 'textarea', section: 'Resolution' },
    { key: 'resolutionNotes', label: 'Resolution Notes', type: 'textarea', section: 'Resolution' },
    { key: 'clientNotified', label: 'Client Notified', type: 'select', section: 'Resolution', options: ['Yes', 'No'] },
    { key: 'internalNotes', label: 'Internal Notes', type: 'textarea', section: 'Resolution' }
  ], [accounts, automations, contacts, projects]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Open Tickets', value: supportTickets.filter(item => !['Resolved', 'Closed'].includes(item.status)).length, tone: 'blue' },
    { label: 'Urgent', value: supportTickets.filter(item => item.priority === 'Urgent').length, tone: 'red' },
    { label: 'Waiting on Client', value: supportTickets.filter(item => item.status === 'Waiting on Client').length, tone: 'neutral' },
    { label: 'Resolved', value: supportTickets.filter(item => item.status === 'Resolved').length, tone: 'green' }
  ], [supportTickets]);

  return (
    <RecordBoard<SupportTicket>
      title="Support Tickets"
      subtitle="Post-launch issues, enhancement requests, root causes, and client updates."
      addLabel="Add Ticket"
      records={supportTickets}
      fields={fields}
      defaultRecord={{
        accountId: '',
        automationId: '',
        projectId: '',
        requestedByContactId: '',
        issueTitle: '',
        issueType: 'Automation failed',
        priority: 'Medium',
        status: 'New',
        description: '',
        dateOpened: new Date().toISOString().slice(0, 10),
        dateResolved: '',
        rootCause: '',
        resolutionNotes: '',
        clientNotified: 'No',
        internalNotes: ''
      }}
      primaryField="issueTitle"
      secondaryFields={['accountId', 'issueType', 'priority', 'dateOpened']}
      badgeField="status"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'accountId') return accounts.find(account => account.id === value)?.name || '';
        if (field === 'requestedByContactId') {
          const contact = contacts.find(item => item.id === value);
          return contact ? `${contact.firstName} ${contact.lastName}` : '';
        }
        if (field === 'projectId') return projects.find(project => project.id === value)?.name || '';
        if (field === 'automationId') return automations.find(automation => automation.id === value)?.name || '';
        return '';
      }}
      onAdd={onAddSupportTicket}
      onUpdate={onUpdateSupportTicket}
    />
  );
};
