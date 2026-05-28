import React, { useMemo } from 'react';
import { Account, Contact, Project, Asset, Vendor } from '../types';
import { FolderGit, Users, HardDrive, BarChart3, Clock } from 'lucide-react';

interface DashboardProps {
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  assets: Asset[];
  vendors: Vendor[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  contacts,
  projects,
  assets,
  vendors,
  setActiveTab
}) => {
  // Compute dashboard metrics
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
    const planningProjects = projects.filter(p => p.status === 'Planning').length;
    const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;

    const avgCompletion = totalProjects > 0 
      ? Math.round(projects.reduce((acc, p) => acc + p.percentageComplete, 0) / totalProjects)
      : 0;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      planningProjects,
      onHoldProjects,
      avgCompletion,
      totalAccounts: accounts.length,
      totalContacts: contacts.length,
      totalAssets: assets.length,
      totalVendors: vendors.length
    };
  }, [accounts, contacts, projects, assets, vendors]);

  // Projects sorted by target date
  const urgentProjects = useMemo(() => {
    return [...projects]
      .filter(p => p.status !== 'Completed')
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      .slice(0, 4);
  }, [projects]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Hero */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--color-silver-mist)'
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--text-heading-lg)',
            lineHeight: 'var(--leading-heading-lg)',
            letterSpacing: 'var(--tracking-heading-lg)',
            fontFamily: 'var(--font-aeonikpro)'
          }}>
            Workspace Overview
          </h2>
          <p style={{ color: 'var(--color-graphite)', fontSize: 'var(--text-body)', marginTop: '8px', maxWidth: '620px' }}>
            A clean view of clients, contacts, assets, and active project momentum.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-sf-pro-text)',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-graphite)'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#248a3d' }} />
          <span>Live workspace</span>
        </div>
      </div>

      {/* Grid of Key Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Accounts Stat */}
        <div className="glassy-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('accounts')}>
          <div style={{ background: 'var(--color-silver-mist)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} style={{ color: 'var(--color-celestial-light)' }} />
          </div>
          <div>
            <div style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-caption)' }}>Active Accounts</div>
            <div style={{ fontSize: 'var(--text-heading)', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>
              {stats.totalAccounts}
            </div>
          </div>
        </div>

        {/* Contacts Stat */}
        <div className="glassy-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('contacts')}>
          <div style={{ background: 'var(--color-silver-mist)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} style={{ color: 'var(--color-azure-glow)' }} />
          </div>
          <div>
            <div style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-caption)' }}>Connected Contacts</div>
            <div style={{ fontSize: 'var(--text-heading)', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>
              {stats.totalContacts}
            </div>
          </div>
        </div>

        {/* Projects Stat */}
        <div className="glassy-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{ background: 'var(--color-silver-mist)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <FolderGit size={24} style={{ color: 'var(--color-neon-violet)' }} />
          </div>
          <div>
            <div style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-caption)' }}>Active Projects</div>
            <div style={{ fontSize: 'var(--text-heading)', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>
              {stats.totalProjects}
            </div>
          </div>
        </div>

        {/* Assets Stat */}
        <div className="glassy-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setActiveTab('assets')}>
          <div style={{ background: 'var(--color-silver-mist)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <HardDrive size={24} style={{ color: 'var(--color-arctic-mist)' }} />
          </div>
          <div>
            <div style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-caption)' }}>Account Assets</div>
            <div style={{ fontSize: 'var(--text-heading)', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>
              {stats.totalAssets}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Status Distribution & Statistics */}
        <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--color-celestial-light)' }} />
            <h3 style={{ fontSize: 'var(--text-subheading)' }}>Project Metrics</h3>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Custom SVG Donut Chart */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-silver-mist)" strokeWidth="4"></circle>
                {/* Planning */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-graphite)" strokeWidth="4" 
                  strokeDasharray={`${stats.totalProjects ? (stats.planningProjects / stats.totalProjects) * 100 : 0} ${100 - (stats.totalProjects ? (stats.planningProjects / stats.totalProjects) * 100 : 0)}`}
                  strokeDashoffset="25">
                </circle>
                {/* In Progress */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-cobalt-link)" strokeWidth="4" 
                  strokeDasharray={`${stats.totalProjects ? (stats.inProgressProjects / stats.totalProjects) * 100 : 0} ${100 - (stats.totalProjects ? (stats.inProgressProjects / stats.totalProjects) * 100 : 0)}`}
                  strokeDashoffset={25 - (stats.totalProjects ? (stats.planningProjects / stats.totalProjects) * 100 : 0)}>
                </circle>
                {/* Completed */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#248a3d" strokeWidth="4" 
                  strokeDasharray={`${stats.totalProjects ? (stats.completedProjects / stats.totalProjects) * 100 : 0} ${100 - (stats.totalProjects ? (stats.completedProjects / stats.totalProjects) * 100 : 0)}`}
                  strokeDashoffset={25 - (stats.totalProjects ? ((stats.planningProjects + stats.inProgressProjects) / stats.totalProjects) * 100 : 0)}>
                </circle>
                {/* On Hold */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--color-caution)" strokeWidth="4" 
                  strokeDasharray={`${stats.totalProjects ? (stats.onHoldProjects / stats.totalProjects) * 100 : 0} ${100 - (stats.totalProjects ? (stats.onHoldProjects / stats.totalProjects) * 100 : 0)}`}
                  strokeDashoffset={25 - (stats.totalProjects ? ((stats.planningProjects + stats.inProgressProjects + stats.completedProjects) / stats.totalProjects) * 100 : 0)}>
                </circle>
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 'var(--text-heading)', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>
                  {stats.avgCompletion}%
                </div>
                <div style={{ fontSize: '9px', color: 'var(--color-whisper-blue)', textTransform: 'uppercase' }}>Avg Progress</div>
              </div>
            </div>

            {/* Legend / Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-cobalt-link)' }} />
                  In Progress
                </span>
                <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{stats.inProgressProjects}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#248a3d' }} />
                  Completed
                </span>
                <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{stats.completedProjects}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-graphite)' }} />
                  Planning
                </span>
                <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{stats.planningProjects}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-caution)' }} />
                  On Hold
                </span>
                <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{stats.onHoldProjects}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable items / Urgent Project list */}
        <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--color-celestial-light)' }} />
            <h3 style={{ fontSize: 'var(--text-subheading)' }}>Approaching Deadlines</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {urgentProjects.length > 0 ? (
              urgentProjects.map(project => {
                const linkedAccount = accounts.find(a => a.id === project.accountId);
                return (
                  <div key={project.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--color-silver-mist)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500, fontSize: 'var(--text-body)' }}>
                        {project.name}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        color: project.status === 'In Progress' ? 'var(--color-cobalt-link)' : 'var(--color-graphite)' 
                      }}>
                        {project.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>
                      <span>Client: {linkedAccount?.name || 'N/A'}</span>
                      <span>Target: {project.targetDate}</span>
                    </div>
                    {/* Completion bar */}
                    <div style={{ width: '100%', height: '4px', background: 'var(--color-silver-mist)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${project.percentageComplete}%`, height: '100%', background: 'var(--color-neon-violet)', borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', textAlign: 'center', padding: '24px 0' }}>
                All projects completed. Nice work!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Overview Portfolio Summary */}
      <div className="glassy-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 'var(--text-subheading)' }}>Project Portfolio Snapshot</h3>
          <button 
            className="btn-secondary-outline" 
            onClick={() => setActiveTab('projects')}
            style={{ padding: '4px 12px', fontSize: 'var(--text-caption)' }}
          >
            Manage Projects
          </button>
        </div>

        <div className="table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map(project => {
                const linkedAccount = accounts.find(a => a.id === project.accountId);
                return (
                  <tr key={project.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-ghost-white)' }}>{project.name}</td>
                    <td>{linkedAccount?.name || 'N/A'}</td>
                    <td>{project.owner}</td>
                    <td>
                      <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: 'var(--color-silver-mist)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${project.percentageComplete}%`, height: '100%', background: project.status === 'Completed' ? '#248a3d' : 'var(--color-neon-violet)' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-dotdigital)', fontSize: 'var(--text-caption)' }}>{project.percentageComplete}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
