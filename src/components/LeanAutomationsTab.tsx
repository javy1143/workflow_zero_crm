import React, { useMemo } from 'react';
import { Account, Automation } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface LeanAutomationsTabProps {
  automations: Automation[];
  accounts: Account[];
  onAddAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAutomation: (id: string, updates: Partial<Omit<Automation, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteAutomation: (id: string) => Promise<void>;
}

export const LeanAutomationsTab: React.FC<LeanAutomationsTabProps> = ({
  automations,
  accounts,
  onAddAutomation,
  onUpdateAutomation,
  onDeleteAutomation
}) => {
  const fields = useMemo<FieldConfig<Automation>[]>(() => [
    { key: 'name', label: 'Automation Name', required: true, section: 'Make.com Flow' },
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Make.com Flow', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Make.com Flow', options: ['Draft', 'Testing', 'Active', 'Error', 'Paused', 'Retired'] },
    { key: 'platform', label: 'Platform', type: 'select', required: true, section: 'Make.com Flow', options: ['Make.com', 'Zapier', 'n8n', 'Firebase Function', 'Other'] },
    { key: 'workflowUrl', label: 'Scenario / Workflow URL', type: 'url', section: 'Make.com Flow' },
    { key: 'triggerSystem', label: 'Trigger System', section: 'Make.com Flow', placeholder: 'Gmail, webhook, form, CRM...' },
    { key: 'triggerEvent', label: 'Trigger Event', section: 'Make.com Flow', placeholder: 'New email, webhook received...' },
    { key: 'actionSystems', label: 'Action Systems', section: 'Make.com Flow', placeholder: 'Firebase, Gmail, Sheets, Slack...' },
    { key: 'description', label: 'What It Does', type: 'textarea', section: 'Make.com Flow' },
    { key: 'criticality', label: 'Criticality', type: 'select', required: true, section: 'Monitoring' , options: ['Low', 'Medium', 'High', 'Business Critical'] },
    { key: 'notificationRecipients', label: 'Alert Recipients', section: 'Monitoring', placeholder: 'Javi, client technical contact...' },
    { key: 'logsLocation', label: 'Logs Location', section: 'Monitoring', placeholder: 'Make history URL, Firebase logs...' },
    { key: 'backupManualProcess', label: 'Manual Backup Process', type: 'textarea', section: 'Monitoring' },
    { key: 'lastSuccessfulRun', label: 'Last Successful Run', type: 'date', section: 'Monitoring' },
    { key: 'lastFailedRun', label: 'Last Failed Run', type: 'date', section: 'Monitoring' },
    { key: 'failuresThisMonth', label: 'Failures This Month', type: 'number', section: 'Monitoring' },
    { key: 'estimatedHoursSavedPerMonth', label: 'Hours Saved / Month', type: 'number', section: 'Reporting' },
    { key: 'nextReviewDate', label: 'Next Review Date', type: 'date', section: 'Reporting' }
  ], [accounts]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Automations', value: automations.length, tone: 'blue' },
    { label: 'Active', value: automations.filter(item => item.status === 'Active').length, tone: 'green' },
    { label: 'Errors', value: automations.filter(item => item.status === 'Error').length, tone: 'red' },
    { label: 'Hours Saved / Month', value: automations.reduce((sum, item) => sum + (Number(item.estimatedHoursSavedPerMonth) || 0), 0), tone: 'cyan' }
  ], [automations]);

  return (
    <RecordBoard<Automation>
      title="Automations"
      subtitle="A Make.com-friendly map of each workflow: trigger, actions, scenario URL, alerts, logs, and value."
      addLabel="Add Automation"
      records={automations}
      fields={fields}
      defaultRecord={{
        accountId: '',
        name: '',
        status: 'Draft',
        platform: 'Make.com',
        workflowUrl: '',
        triggerSystem: '',
        triggerEvent: '',
        actionSystems: '',
        description: '',
        criticality: 'Medium',
        notificationRecipients: '',
        logsLocation: '',
        backupManualProcess: '',
        lastSuccessfulRun: '',
        lastFailedRun: '',
        failuresThisMonth: 0,
        estimatedHoursSavedPerMonth: 0,
        nextReviewDate: ''
      }}
      primaryField="name"
      secondaryFields={['accountId', 'platform', 'triggerSystem', 'nextReviewDate']}
      badgeField="status"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => field === 'accountId' ? accounts.find(account => account.id === value)?.name || '' : ''}
      onAdd={onAddAutomation}
      onUpdate={onUpdateAutomation}
      onDelete={onDeleteAutomation}
    />
  );
};
