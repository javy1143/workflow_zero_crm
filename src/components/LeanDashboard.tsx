import React, { useMemo } from 'react';
import { Account, Automation, Contact, Report, Task } from '../types';
import { Bot, FileText, ListChecks, Users } from 'lucide-react';

interface LeanDashboardProps {
  accounts: Account[];
  contacts: Contact[];
  automations: Automation[];
  tasks: Task[];
  reports: Report[];
  setActiveTab: (tab: string) => void;
}

const today = new Date().toISOString().slice(0, 10);
const next7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const LeanDashboard: React.FC<LeanDashboardProps> = ({
  accounts,
  contacts,
  automations,
  tasks,
  reports,
  setActiveTab
}) => {
  const currentDate = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const metrics = useMemo(() => {
    const activeClients = accounts.filter(account => ['Active Client', 'Active'].includes(account.status)).length;
    const followUps = accounts.filter(account => account.nextFollowUpDate && account.nextFollowUpDate <= next7).length;
    const openTasks = tasks.filter(task => task.status !== 'Completed').length;
    const automationsInError = automations.filter(automation => automation.status === 'Error').length;
    const reportsToSend = reports.filter(report => ['Draft', 'Ready', 'Follow-Up Needed'].includes(report.status)).length;

    return [
      { label: 'Active Clients', value: activeClients, tab: 'accounts', icon: <Users size={22} /> },
      { label: 'Follow-Ups', value: followUps, tab: 'accounts', icon: <ListChecks size={22} /> },
      { label: 'Open Tasks', value: openTasks, tab: 'tasks', icon: <ListChecks size={22} /> },
      { label: 'Automation Errors', value: automationsInError, tab: 'automations', icon: <Bot size={22} /> },
      { label: 'Reports to Send', value: reportsToSend, tab: 'reports', icon: <FileText size={22} /> }
    ];
  }, [accounts, automations, reports, tasks]);

  const nextTasks = tasks
    .filter(task => task.status !== 'Completed')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  const watchedAutomations = automations
    .filter(automation => automation.status === 'Error' || automation.nextReviewDate === today || automation.nextReviewDate === next7)
    .slice(0, 5);

  const accountName = (id: string) => accounts.find(account => account.id === id)?.name || 'Unknown account';

  return (
    <div className="dashboard-shell">
      <section className="dashboard-summary">
        <div>
          <h1>Dashboard</h1>
          <p>{currentDate}</p>
        </div>
        <div className="summary-meta">
          <span>{accounts.length} accounts</span>
          <span>{contacts.length} contacts</span>
          <span>{automations.length} automations</span>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map(metric => (
          <button className="metric-card" key={metric.label} onClick={() => setActiveTab(metric.tab)}>
            <span style={{ color: 'var(--wz-blue)' }}>{metric.icon}</span>
            <div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          </button>
        ))}
      </section>

      <section className="dashboard-grid lean-grid">
        <div className="glassy-card">
          <div className="panel-title">
            <h3>Today / Next</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('tasks')}>Tasks</button>
          </div>
          <div className="compact-list">
            {nextTasks.length ? nextTasks.map(task => (
              <div key={task.id}>
                <strong>{task.name}</strong>
                <span>{accountName(task.accountId)} / {task.priority} / due {task.dueDate || 'not set'}</span>
              </div>
            )) : <p>No open tasks. Your board is clean.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Automation Watchlist</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('automations')}>Automations</button>
          </div>
          <div className="compact-list">
            {watchedAutomations.length ? watchedAutomations.map(automation => (
              <div key={automation.id}>
                <strong>{automation.name}</strong>
                <span>{accountName(automation.accountId)} / {automation.status} / review {automation.nextReviewDate || 'not set'}</span>
              </div>
            )) : <p>No automation errors or reviews due.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Pipeline Snapshot</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('accounts')}>Accounts</button>
          </div>
          <div className="scope-stack">
            <span>{accounts.length} accounts</span>
            <span>{contacts.length} contacts</span>
            <span>{accounts.filter(account => account.status === 'New Lead' || account.status === 'Lead').length} new leads</span>
            <span>{accounts.filter(account => account.health === 'Yellow' || account.health === 'Red').length} health flags</span>
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Reports</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('reports')}>Reports</button>
          </div>
          <div className="compact-list">
            {reports.slice(0, 5).map(report => (
              <div key={report.id}>
                <strong>{report.reportingPeriod || report.reportType}</strong>
                <span>{accountName(report.accountId)} / {report.status}</span>
              </div>
            ))}
            {!reports.length && <p>No reports created yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};
