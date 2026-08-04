import React, { useMemo } from 'react';
import { Account, Automation, Project } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface AutomationsTabProps {
  automations: Automation[];
  accounts: Account[];
  projects: Project[];
  onAddAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAutomation: (id: string, updates: Partial<Omit<Automation, 'id' | 'createdAt'>>) => Promise<void>;
}

export const AutomationsTab: React.FC<AutomationsTabProps> = ({
  automations,
  accounts,
  projects,
  onAddAutomation,
  onUpdateAutomation
}) => {
  const fields = useMemo<FieldConfig<Automation>[]>(() => [
    { key: 'name', label: 'Automation Name', required: true, section: 'Core Details' },
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Core Details', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'projectId', label: 'Related Project', type: 'select', section: 'Core Details', options: projects.map(project => ({ value: project.id, label: project.name })) },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Core Details', options: ['Draft', 'Testing', 'Active', 'Error', 'Paused', 'Retired'] },
    { key: 'platform', label: 'Platform', required: true, section: 'Core Details', placeholder: 'Make.com, Zapier, n8n, Firebase Function' },
    { key: 'workflowUrl', label: 'Workflow URL', type: 'url', section: 'Core Details' },
    { key: 'criticality', label: 'Criticality', type: 'select', required: true, section: 'Core Details', options: ['Low', 'Medium', 'High', 'Business Critical'] },
    { key: 'description', label: 'Description', type: 'textarea', section: 'Process' },
    { key: 'businessProcess', label: 'Business Process Automated', section: 'Process' },
    { key: 'processOwner', label: 'Process Owner', section: 'Process' },
    { key: 'triggerSystem', label: 'Trigger System', section: 'Process' },
    { key: 'triggerEvent', label: 'Trigger Event', section: 'Process' },
    { key: 'actionSystems', label: 'Action Systems', section: 'Process' },
    { key: 'connectedApps', label: 'Connected Apps', section: 'Process' },
    { key: 'apiDependencies', label: 'API Dependencies', section: 'AI and Data' },
    { key: 'dataProcessed', label: 'Data Processed', type: 'textarea', section: 'AI and Data' },
    { key: 'aiModelUsed', label: 'AI Model Used', section: 'AI and Data' },
    { key: 'promptLocation', label: 'Prompt Location', section: 'AI and Data' },
    { key: 'errorHandlingMethod', label: 'Error Handling Method', type: 'textarea', section: 'Monitoring' },
    { key: 'notificationRecipients', label: 'Notification Recipients', section: 'Monitoring' },
    { key: 'logsLocation', label: 'Logs Location', section: 'Monitoring' },
    { key: 'backupManualProcess', label: 'Backup / Manual Process', type: 'textarea', section: 'Monitoring' },
    { key: 'lastSuccessfulRun', label: 'Last Successful Run', type: 'date', section: 'Monitoring' },
    { key: 'lastFailedRun', label: 'Last Failed Run', type: 'date', section: 'Monitoring' },
    { key: 'failuresThisMonth', label: 'Failures This Month', type: 'number', section: 'Monitoring' },
    { key: 'estimatedHoursSavedPerMonth', label: 'Estimated Hours Saved / Month', type: 'number', section: 'Value' },
    { key: 'monthlyUsageCost', label: 'Monthly Usage Cost', type: 'number', section: 'Value' },
    { key: 'lastReviewedDate', label: 'Last Reviewed Date', type: 'date', section: 'Review' },
    { key: 'nextReviewDate', label: 'Next Review Date', type: 'date', section: 'Review' }
  ], [accounts, projects]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Active Automations', value: automations.filter(item => item.status === 'Active').length, tone: 'green' },
    { label: 'In Error', value: automations.filter(item => item.status === 'Error').length, tone: 'red' },
    { label: 'Business Critical', value: automations.filter(item => item.criticality === 'Business Critical').length, tone: 'cyan' },
    { label: 'Hours Saved / Month', value: automations.reduce((sum, item) => sum + (Number(item.estimatedHoursSavedPerMonth) || 0), 0), tone: 'blue' }
  ], [automations]);

  return (
    <RecordBoard<Automation>
      title="Automations"
      subtitle="Live and planned workflows managed for recurring client operations."
      addLabel="Add Automation"
      records={automations}
      fields={fields}
      defaultRecord={{
        accountId: '',
        projectId: '',
        name: '',
        status: 'Draft',
        platform: '',
        workflowUrl: '',
        description: '',
        businessProcess: '',
        processOwner: '',
        criticality: 'Medium',
        triggerSystem: '',
        triggerEvent: '',
        actionSystems: '',
        connectedApps: '',
        apiDependencies: '',
        dataProcessed: '',
        aiModelUsed: '',
        promptLocation: '',
        errorHandlingMethod: '',
        notificationRecipients: '',
        logsLocation: '',
        backupManualProcess: '',
        lastSuccessfulRun: '',
        lastFailedRun: '',
        failuresThisMonth: 0,
        estimatedHoursSavedPerMonth: 0,
        monthlyUsageCost: 0,
        lastReviewedDate: '',
        nextReviewDate: ''
      }}
      primaryField="name"
      secondaryFields={['accountId', 'platform', 'criticality', 'nextReviewDate']}
      badgeField="status"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'accountId') return accounts.find(account => account.id === value)?.name || '';
        if (field === 'projectId') return projects.find(project => project.id === value)?.name || '';
        return '';
      }}
      onAdd={onAddAutomation}
      onUpdate={onUpdateAutomation}
    />
  );
};
