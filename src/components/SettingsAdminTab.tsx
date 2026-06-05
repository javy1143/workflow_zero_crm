import React, { useMemo } from 'react';
import { AdminSettings } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface SettingsAdminTabProps {
  adminSettings: AdminSettings[];
  onAddAdminSettings: (settings: Omit<AdminSettings, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAdminSettings: (id: string, updates: Partial<Omit<AdminSettings, 'id' | 'createdAt'>>) => Promise<void>;
}

export const SettingsAdminTab: React.FC<SettingsAdminTabProps> = ({
  adminSettings,
  onAddAdminSettings,
  onUpdateAdminSettings
}) => {
  const fields = useMemo<FieldConfig<AdminSettings>[]>(() => [
    { key: 'companyName', label: 'Company Name', required: true, section: 'Company Settings' },
    { key: 'businessEmail', label: 'Business Email', type: 'email', required: true, section: 'Company Settings' },
    { key: 'timezone', label: 'Timezone', required: true, section: 'Company Settings' },
    { key: 'defaultAccountOwner', label: 'Default Account Owner', section: 'System Defaults' },
    { key: 'reportFrequencyDefault', label: 'Report Frequency Default', type: 'select', section: 'System Defaults', options: ['Monthly', 'Quarterly', 'Project-based'] },
    { key: 'taskReminderTiming', label: 'Task Reminder Timing', section: 'Notifications' },
    { key: 'renewalReminderWindow', label: 'Renewal Reminder Window', type: 'select', section: 'Notifications', options: ['30 days', '60 days', '90 days'] },
    { key: 'failedAutomationAlertRule', label: 'Failed Automation Alert Rule', type: 'select', section: 'Notifications', options: ['Immediately on error', 'Daily digest', 'Both'] },
    { key: 'clientFacingVisibilityDefault', label: 'Client-Facing Visibility Default', type: 'select', section: 'Security' , options: ['Internal by default', 'Client-visible by default'] },
    { key: 'exportPermission', label: 'Export Permission', type: 'select', section: 'Security', options: ['Admin only', 'Internal users', 'Disabled'] },
    { key: 'auditLogEnabled', label: 'Audit Log Enabled', type: 'select', section: 'Security', options: ['Yes', 'No'] },
    { key: 'mfaRequired', label: 'MFA Required', type: 'select', section: 'Security', options: ['Yes', 'No'] },
    { key: 'sessionTimeout', label: 'Session Timeout', section: 'Security' },
    { key: 'brandNotes', label: 'Templates / Brand / Integration Notes', type: 'textarea', section: 'Templates and Integrations' }
  ], []);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Setting Profiles', value: adminSettings.length, tone: 'blue' },
    { label: 'MFA Required', value: adminSettings.filter(item => item.mfaRequired === 'Yes').length, tone: 'green' },
    { label: 'Audit Logs Enabled', value: adminSettings.filter(item => item.auditLogEnabled === 'Yes').length, tone: 'cyan' }
  ], [adminSettings]);

  return (
    <RecordBoard<AdminSettings>
      title="Settings / Admin"
      subtitle="System defaults, notifications, security controls, templates, and non-secret integration references."
      addLabel="Add Settings Profile"
      records={adminSettings}
      fields={fields}
      defaultRecord={{
        companyName: 'Workflow Zero IT',
        businessEmail: '',
        timezone: 'America/New_York',
        defaultAccountOwner: 'Javi',
        reportFrequencyDefault: 'Monthly',
        taskReminderTiming: '1 day before due date',
        renewalReminderWindow: '30 days',
        failedAutomationAlertRule: 'Immediately on error',
        clientFacingVisibilityDefault: 'Internal by default',
        exportPermission: 'Admin only',
        auditLogEnabled: 'Yes',
        mfaRequired: 'Yes',
        sessionTimeout: '8 hours',
        brandNotes: ''
      }}
      primaryField="companyName"
      secondaryFields={['businessEmail', 'timezone', 'defaultAccountOwner', 'reportFrequencyDefault']}
      badgeField="mfaRequired"
      filterField="mfaRequired"
      filterLabel="MFA States"
      metrics={metrics}
      onAdd={onAddAdminSettings}
      onUpdate={onUpdateAdminSettings}
    />
  );
};
