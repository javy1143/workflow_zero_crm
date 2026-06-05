import React, { useMemo } from 'react';
import {
  Account,
  Activity,
  Asset,
  Automation,
  BillingContract,
  Contact,
  Project,
  Report,
  SupportTicket,
  Task
} from '../types';
import {
  AlertTriangle,
  BadgeDollarSign,
  Bot,
  CheckCircle2,
  Clock,
  FileBarChart2,
  FolderGit,
  HeartPulse,
  ListChecks,
  Users
} from 'lucide-react';

interface DashboardProps {
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  assets: Asset[];
  activities: Activity[];
  automations: Automation[];
  tasks: Task[];
  supportTickets: SupportTicket[];
  reports: Report[];
  billingContracts: BillingContract[];
  setActiveTab: (tab: string) => void;
}

const today = new Date().toISOString().slice(0, 10);
const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const next7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const money = (value: number) => `$${value.toLocaleString()}`;

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  contacts,
  projects,
  assets,
  activities,
  automations,
  tasks,
  supportTickets,
  reports,
  billingContracts,
  setActiveTab
}) => {
  const stats = useMemo(() => {
    const activeClients = accounts.filter(account => ['Active Client', 'Active'].includes(account.status)).length;
    const mrr = billingContracts
      .filter(contract => !['Cancelled', 'Expired'].includes(contract.contractStatus))
      .reduce((sum, contract) => sum + (Number(contract.monthlyRecurringFee) || 0), 0);
    const openProjects = projects.filter(project => !['Completed', 'Cancelled'].includes(project.status)).length;
    const dueSoonProjects = projects.filter(project => project.targetDate && project.targetDate >= today && project.targetDate <= next7 && !['Completed', 'Cancelled'].includes(project.status)).length;
    const errorAutomations = automations.filter(automation => automation.status === 'Error').length;
    const openTickets = supportTickets.filter(ticket => !['Resolved', 'Closed'].includes(ticket.status)).length;
    const reportsDue = reports.filter(report => ['Draft', 'Ready', 'Follow-Up Needed'].includes(report.status)).length;
    const followUps = accounts.filter(account => account.nextFollowUpDate && account.nextFollowUpDate <= next7).length + tasks.filter(task => task.status !== 'Completed' && task.dueDate && task.dueDate <= next7).length;
    const renewalsDue = billingContracts.filter(contract => contract.renewalDate && contract.renewalDate >= today && contract.renewalDate <= next30).length;
    const pastDue = billingContracts.filter(contract => contract.paymentStatus === 'Past Due').length;

    return {
      activeClients,
      mrr,
      openProjects,
      dueSoonProjects,
      errorAutomations,
      openTickets,
      reportsDue,
      followUps,
      renewalsDue,
      pastDue
    };
  }, [accounts, automations, billingContracts, projects, reports, supportTickets, tasks]);

  const pipeline = useMemo(() => {
    const stages = ['New Lead', 'Contacted', 'Discovery Scheduled', 'Proposal Sent', 'Contract Sent', 'Active Client', 'Lost'];
    return stages.map(stage => ({
      stage,
      count: accounts.filter(account => account.status === stage || (stage === 'New Lead' && account.status === 'Lead')).length
    }));
  }, [accounts]);

  const attentionAccounts = accounts.filter(account => account.health === 'Yellow' || account.health === 'Red').slice(0, 5);
  const urgentTasks = tasks.filter(task => task.status !== 'Completed').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 5);
  const errorAutomations = automations.filter(automation => automation.status === 'Error').slice(0, 5);
  const upcomingBilling = billingContracts
    .filter(contract => contract.nextInvoiceDate || contract.renewalDate || contract.paymentStatus === 'Past Due')
    .sort((a, b) => (a.nextInvoiceDate || a.renewalDate || '').localeCompare(b.nextInvoiceDate || b.renewalDate || ''))
    .slice(0, 5);

  const metricCards = [
    { label: 'Active Clients', value: stats.activeClients, tab: 'accounts', icon: <Users size={22} />, tone: 'var(--wz-blue)' },
    { label: 'Monthly Recurring Revenue', value: money(stats.mrr), tab: 'billing', icon: <BadgeDollarSign size={22} />, tone: '#248a3d' },
    { label: 'Open Projects', value: stats.openProjects, tab: 'projects', icon: <FolderGit size={22} />, tone: 'var(--wz-cyan)' },
    { label: 'Projects Due in 7 Days', value: stats.dueSoonProjects, tab: 'projects', icon: <Clock size={22} />, tone: 'var(--wz-blue)' },
    { label: 'Automations in Error', value: stats.errorAutomations, tab: 'automations', icon: <AlertTriangle size={22} />, tone: 'var(--color-caution)' },
    { label: 'Open Support Tickets', value: stats.openTickets, tab: 'support', icon: <HeartPulse size={22} />, tone: 'var(--color-caution)' },
    { label: 'Reports Due', value: stats.reportsDue, tab: 'reports', icon: <FileBarChart2 size={22} />, tone: 'var(--wz-blue)' },
    { label: 'Follow-Ups Needed', value: stats.followUps, tab: 'tasks', icon: <ListChecks size={22} />, tone: 'var(--wz-cyan)' },
    { label: 'Renewals in 30 Days', value: stats.renewalsDue, tab: 'billing', icon: <CheckCircle2 size={22} />, tone: '#248a3d' },
    { label: 'Past-Due Billing', value: stats.pastDue, tab: 'billing', icon: <BadgeDollarSign size={22} />, tone: 'var(--color-caution)' }
  ];

  const accountName = (id: string) => accounts.find(account => account.id === id)?.name || 'Unknown account';

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Workflow Zero IT CRM</span>
          <h1>Operating view</h1>
          <p>Pipeline, delivery, automation health, support, reporting, billing, and client risk in one lean workspace.</p>
        </div>
        <div className="hero-stat">
          <Bot size={28} />
          <strong>{automations.filter(item => item.status === 'Active').length}</strong>
          <span>active managed automations</span>
        </div>
      </section>

      <section className="metric-grid">
        {metricCards.map(card => (
          <button className="metric-card" key={card.label} onClick={() => setActiveTab(card.tab)}>
            <span style={{ color: card.tone }}>{card.icon}</span>
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          </button>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="glassy-card">
          <div className="panel-title">
            <h3>Account Pipeline</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('accounts')}>Open Accounts</button>
          </div>
          <div className="pipeline-list">
            {pipeline.map(item => (
              <div key={item.stage}>
                <span>{item.stage}</span>
                <strong>{item.count}</strong>
                <div><span style={{ width: `${Math.min(100, item.count * 18)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Tasks Due</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('tasks')}>Open Tasks</button>
          </div>
          <div className="compact-list">
            {urgentTasks.length ? urgentTasks.map(task => (
              <div key={task.id}>
                <strong>{task.name}</strong>
                <span>{accountName(task.accountId)} / {task.priority} / due {task.dueDate || 'not set'}</span>
              </div>
            )) : <p>No open tasks due soon.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Automation Health</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('automations')}>Open Automations</button>
          </div>
          <div className="compact-list">
            {errorAutomations.length ? errorAutomations.map(automation => (
              <div key={automation.id}>
                <strong>{automation.name}</strong>
                <span>{accountName(automation.accountId)} / {automation.criticality} / {automation.failuresThisMonth || 0} failures this month</span>
              </div>
            )) : <p>No automations currently marked Error.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Billing Snapshot</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('billing')}>Open Billing</button>
          </div>
          <div className="compact-list">
            {upcomingBilling.length ? upcomingBilling.map(contract => (
              <div key={contract.id}>
                <strong>{accountName(contract.accountId)}</strong>
                <span>{contract.paymentStatus} / next invoice {contract.nextInvoiceDate || 'not set'} / renewal {contract.renewalDate || 'not set'}</span>
              </div>
            )) : <p>No billing records need attention.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Client Health</h3>
            <button className="btn-secondary-outline" onClick={() => setActiveTab('accounts')}>Open Accounts</button>
          </div>
          <div className="compact-list">
            {attentionAccounts.length ? attentionAccounts.map(account => (
              <div key={account.id}>
                <strong>{account.name}</strong>
                <span>{account.health} / next action: {account.nextAction || 'not set'}</span>
              </div>
            )) : <p>No accounts marked Yellow or Red.</p>}
          </div>
        </div>

        <div className="glassy-card">
          <div className="panel-title">
            <h3>Workspace Scope</h3>
          </div>
          <div className="scope-stack">
            <span>{contacts.length} contacts</span>
            <span>{assets.length} assets</span>
            <span>{activities.length} interactions logged</span>
            <span>{supportTickets.length} support tickets</span>
            <span>{reports.length} reports</span>
          </div>
        </div>
      </section>
    </div>
  );
};
