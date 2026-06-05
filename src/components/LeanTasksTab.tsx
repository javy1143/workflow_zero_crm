import React, { useMemo } from 'react';
import { Account, Automation, Contact, Task } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface LeanTasksTabProps {
  tasks: Task[];
  accounts: Account[];
  contacts: Contact[];
  automations: Automation[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const today = new Date().toISOString().slice(0, 10);

export const LeanTasksTab: React.FC<LeanTasksTabProps> = ({
  tasks,
  accounts,
  contacts,
  automations,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const fields = useMemo<FieldConfig<Task>[]>(() => [
    { key: 'name', label: 'Task', required: true, section: 'Task' },
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Task', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'taskType', label: 'Type', type: 'select', required: true, section: 'Task', options: ['Follow-up', 'Request Access', 'Build Automation', 'Test Workflow', 'Fix Error', 'Send Report', 'Review Billing', 'Client Training'] },
    { key: 'assignedTo', label: 'Assigned To', required: true, section: 'Task' },
    { key: 'dueDate', label: 'Due Date', type: 'date', required: true, section: 'Task' },
    { key: 'priority', label: 'Priority', type: 'select', required: true, section: 'Task', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Task', options: ['Not Started', 'In Progress', 'Waiting on Client', 'Completed'] },
    { key: 'contactId', label: 'Contact', type: 'select', section: 'Optional Link', options: contacts.map(contact => ({ value: contact.id, label: `${contact.firstName} ${contact.lastName}` })) },
    { key: 'automationId', label: 'Automation', type: 'select', section: 'Optional Link', options: automations.map(automation => ({ value: automation.id, label: automation.name })) },
    { key: 'notes', label: 'Notes', type: 'textarea', section: 'Notes' }
  ], [accounts, automations, contacts]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Open', value: tasks.filter(item => item.status !== 'Completed').length, tone: 'blue' },
    { label: 'Overdue', value: tasks.filter(item => item.status !== 'Completed' && item.dueDate && item.dueDate < today).length, tone: 'red' },
    { label: 'Waiting on Client', value: tasks.filter(item => item.status === 'Waiting on Client').length, tone: 'neutral' },
    { label: 'Completed', value: tasks.filter(item => item.status === 'Completed').length, tone: 'green' }
  ], [tasks]);

  return (
    <RecordBoard<Task>
      title="Tasks"
      subtitle="The action list for sales follow-ups, Make.com builds, access requests, fixes, and reports."
      addLabel="Add Task"
      records={tasks}
      fields={fields}
      defaultRecord={{
        accountId: '',
        contactId: '',
        automationId: '',
        name: '',
        taskType: 'Follow-up',
        assignedTo: 'Javi',
        dueDate: '',
        priority: 'Medium',
        status: 'Not Started',
        notes: ''
      }}
      primaryField="name"
      secondaryFields={['accountId', 'taskType', 'assignedTo', 'dueDate']}
      badgeField="status"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'accountId') return accounts.find(account => account.id === value)?.name || '';
        if (field === 'contactId') {
          const contact = contacts.find(item => item.id === value);
          return contact ? `${contact.firstName} ${contact.lastName}` : '';
        }
        if (field === 'automationId') return automations.find(automation => automation.id === value)?.name || '';
        return '';
      }}
      onAdd={onAddTask}
      onUpdate={onUpdateTask}
      onDelete={onDeleteTask}
    />
  );
};
