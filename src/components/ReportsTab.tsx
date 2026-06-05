import React, { useMemo } from 'react';
import { Account, Automation, Project, Report } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface ReportsTabProps {
  reports: Report[];
  accounts: Account[];
  projects: Project[];
  automations: Automation[];
  onAddReport: (report: Omit<Report, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateReport: (id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>) => Promise<void>;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  reports,
  accounts,
  projects,
  automations,
  onAddReport,
  onUpdateReport
}) => {
  const fields = useMemo<FieldConfig<Report>[]>(() => [
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Core Details', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'projectId', label: 'Related Project', type: 'select', section: 'Core Details', options: projects.map(project => ({ value: project.id, label: project.name })) },
    { key: 'automationId', label: 'Related Automation', type: 'select', section: 'Core Details', options: automations.map(automation => ({ value: automation.id, label: automation.name })) },
    { key: 'reportType', label: 'Report Type', type: 'select', required: true, section: 'Core Details', options: ['Monthly performance', 'Project status', 'ROI', 'Error report'] },
    { key: 'reportingPeriod', label: 'Reporting Period', required: true, section: 'Core Details', placeholder: 'June 2026' },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Core Details', options: ['Draft', 'Ready', 'Sent', 'Reviewed', 'Follow-Up Needed'] },
    { key: 'createdDate', label: 'Created Date', type: 'date', required: true, section: 'Core Details' },
    { key: 'sentDate', label: 'Sent Date', type: 'date', section: 'Core Details' },
    { key: 'sentTo', label: 'Sent To', section: 'Core Details' },
    { key: 'reportLink', label: 'Report Link', type: 'url', section: 'Core Details' },
    { key: 'successfulRuns', label: 'Successful Runs', type: 'number', section: 'Performance Metrics' },
    { key: 'failedRuns', label: 'Failed Runs', type: 'number', section: 'Performance Metrics' },
    { key: 'errorRate', label: 'Error Rate', section: 'Performance Metrics' },
    { key: 'hoursSaved', label: 'Hours Saved', type: 'number', section: 'Performance Metrics' },
    { key: 'estimatedCostSavings', label: 'Estimated Cost Savings', type: 'number', section: 'Performance Metrics' },
    { key: 'issuesResolved', label: 'Issues Resolved', type: 'textarea', section: 'Narrative' },
    { key: 'improvementsMade', label: 'Improvements Made', type: 'textarea', section: 'Narrative' },
    { key: 'recommendations', label: 'Recommendations', type: 'textarea', section: 'Narrative' },
    { key: 'clientActionItems', label: 'Client Action Items', type: 'textarea', section: 'Narrative' },
    { key: 'nextSteps', label: 'Next Steps', type: 'textarea', section: 'Narrative' }
  ], [accounts, automations, projects]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Reports Due / Draft', value: reports.filter(item => item.status === 'Draft' || item.status === 'Ready').length, tone: 'blue' },
    { label: 'Sent Reports', value: reports.filter(item => item.status === 'Sent' || item.status === 'Reviewed').length, tone: 'green' },
    { label: 'Follow-Up Needed', value: reports.filter(item => item.status === 'Follow-Up Needed').length, tone: 'red' },
    { label: 'Hours Saved Reported', value: reports.reduce((sum, item) => sum + (Number(item.hoursSaved) || 0), 0), tone: 'cyan' }
  ], [reports]);

  return (
    <RecordBoard<Report>
      title="Reports"
      subtitle="Client-facing proof of value: runs, failures, hours saved, fixes, recommendations, and next steps."
      addLabel="Add Report"
      records={reports}
      fields={fields}
      defaultRecord={{
        accountId: '',
        projectId: '',
        automationId: '',
        reportType: 'Monthly performance',
        reportingPeriod: '',
        status: 'Draft',
        createdDate: new Date().toISOString().slice(0, 10),
        sentDate: '',
        sentTo: '',
        reportLink: '',
        successfulRuns: 0,
        failedRuns: 0,
        errorRate: '',
        hoursSaved: 0,
        estimatedCostSavings: 0,
        issuesResolved: '',
        improvementsMade: '',
        recommendations: '',
        clientActionItems: '',
        nextSteps: ''
      }}
      primaryField="reportingPeriod"
      secondaryFields={['accountId', 'reportType', 'hoursSaved', 'sentDate']}
      badgeField="status"
      filterField="status"
      filterLabel="Report States"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'accountId') return accounts.find(account => account.id === value)?.name || '';
        if (field === 'projectId') return projects.find(project => project.id === value)?.name || '';
        if (field === 'automationId') return automations.find(automation => automation.id === value)?.name || '';
        return '';
      }}
      onAdd={onAddReport}
      onUpdate={onUpdateReport}
    />
  );
};
