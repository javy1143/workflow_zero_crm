import React, { useMemo } from 'react';
import { Account, Automation, Contact, Project, SupportTicket, Task } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface TasksTabProps {
  tasks: Task[];
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  automations: Automation[];
  supportTickets: SupportTicket[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  accounts,
  contacts,
  projects,
  automations,
  supportTickets,
  onAddTask,
  onUpdateTask
}) => {
  const fields = useMemo<FieldConfig<Task>[]>(() => [
    { key: 'name', label: 'Task Name', required: true, section: 'Core Details' },
    { key: 'accountId', label: 'Related Account', type: 'select', required: true, section: 'Core Details', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'taskType', label: 'Task Type', type: 'select', required: true, section: 'Core Details', options: ['Follow-up', 'Schedule Discovery Call', 'Send Proposal', 'Send Contract', 'Request Access', 'Build Automation', 'Test Workflow', 'Fix Error', 'Send Report', 'Review Billing', 'Client Training', 'Access Review'] },
    { key: 'assignedTo', label: 'Assigned To', required: true, section: 'Core Details' },
    { key: 'dueDate', label: 'Due Date', type: 'date', required: true, section: 'Core Details' },
    { key: 'priority', label: 'Priority', type: 'select', required: true, section: 'Core Details', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Core Details', options: ['Not Started', 'In Progress', 'Waiting on Client', 'Completed'] },
    { key: 'contactId', label: 'Related Contact', type: 'select', section: 'Relationships', options: contacts.map(contact => ({ value: contact.id, label: `${contact.firstName} ${contact.lastName}` })) },
    { key: 'projectId', label: 'Related Project', type: 'select', section: 'Relationships', options: projects.map(project => ({ value: project.id, label: project.name })) },
    { key: 'automationId', label: 'Related Automation', type: 'select', section: 'Relationships', options: automations.map(automation => ({ value: automation.id, label: automation.name })) },
    { key: 'supportTicketId', label: 'Related Support Ticket', type: 'select', section: 'Relationships', options: supportTickets.map(ticket => ({ value: ticket.id, label: ticket.issueTitle })) },
    { key: 'notes', label: 'Notes', type: 'textarea', section: 'Notes' }
  ], [accounts, automations, contacts, projects, supportTickets]);

  const today = new Date().toISOString().slice(0, 10);
  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Open Tasks', value: tasks.filter(item => item.status !== 'Completed').length, tone: 'blue' },
    { label: 'Due Today', value: tasks.filter(item => item.status !== 'Completed' && item.dueDate === today).length, tone: 'cyan' },
    { label: 'Overdue', value: tasks.filter(item => item.status !== 'Completed' && item.dueDate && item.dueDate < today).length, tone: 'red' },
    { label: 'Waiting on Client', value: tasks.filter(item => item.status === 'Waiting on Client').length, tone: 'neutral' }
  ], [tasks, today]);

  return (
    <RecordBoard<Task>
      title="Tasks"
      subtitle="Follow-ups, build work, requests, reporting actions, and internal delivery tasks."
      addLabel="Add Task"
      records={tasks}
      fields={fields}
      defaultRecord={{
        accountId: '',
        contactId: '',
        projectId: '',
        automationId: '',
        supportTicketId: '',
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
        if (field === 'projectId') return projects.find(project => project.id === value)?.name || '';
        if (field === 'automationId') return automations.find(automation => automation.id === value)?.name || '';
        if (field === 'supportTicketId') return supportTickets.find(ticket => ticket.id === value)?.issueTitle || '';
        return '';
      }}
      onAdd={onAddTask}
      onUpdate={onUpdateTask}
    />
  );
};
