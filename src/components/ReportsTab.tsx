import React, { useState, useMemo } from 'react';
import { Account, Contact, Project, Asset } from '../types';
import { Printer, FileText, CheckCircle, Clock } from 'lucide-react';

interface ReportsTabProps {
  accounts: Account[];
  contacts: Contact[];
  projects: Project[];
  assets: Asset[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  accounts,
  contacts,
  projects,
  assets
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === selectedAccountId);
  }, [selectedAccountId, accounts]);

  // Aggregate information for the active account
  const accountReportData = useMemo(() => {
    if (!selectedAccountId) return null;

    const accountProjects = projects.filter(p => p.accountId === selectedAccountId);
    const accountContacts = contacts.filter(c => c.accountId === selectedAccountId);
    const accountAssets = assets.filter(a => a.accountId === selectedAccountId);

    const completedProjects = accountProjects.filter(p => p.status === 'Completed');
    const ongoingProjects = accountProjects.filter(p => p.status === 'In Progress' || p.status === 'Planning' || p.status === 'On Hold');

    const totalProjects = accountProjects.length;
    const avgCompletion = totalProjects > 0
      ? Math.round(accountProjects.reduce((sum, p) => sum + p.percentageComplete, 0) / totalProjects)
      : 0;

    return {
      projects: accountProjects,
      contacts: accountContacts,
      assets: accountAssets,
      completedProjects,
      ongoingProjects,
      avgCompletion,
      totalProjects
    };
  }, [selectedAccountId, projects, contacts, assets]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Selector Bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Client Progress Reports
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Run real-time progress reports compiling account metrics, assets, and project pipelines.
          </p>
        </div>
      </div>

      {/* Account Selector */}
      <div className="glassy-card no-print" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px'
      }}>
        <label style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', fontWeight: 500 }}>
          Select Client Account:
        </label>
        <select
          className="input-minimal"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          style={{ width: '280px', padding: '10px' }}
        >
          <option value="">-- Choose Account --</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({acc.status})</option>
          ))}
        </select>
      </div>

      {/* Report Showcase Screen */}
      {activeAccount && accountReportData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Action Bar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary-pill" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print/Save PDF Report</span>
            </button>
          </div>

          {/* Printable Report Document */}
          <div className="glassy-card" style={{
            padding: '40px',
            background: 'var(--color-fog)',
            border: '1px solid var(--color-silver-mist)',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            color: 'var(--color-comet)'
          }}>
            {/* Report Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--color-silver-mist)',
              paddingBottom: '24px'
            }}>
              <div>
                <img 
                  src="/logo.png" 
                  alt="Workflow Zero Logo" 
                  style={{ height: '32px', objectFit: 'contain', marginBottom: '12px' }}
                />
                <h1 style={{ fontSize: 'var(--text-heading-lg)', color: 'var(--color-ghost-white)' }}>
                  CLIENT PROGRESS REPORT
                </h1>
                <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-caption)', marginTop: '4px', fontFamily: 'var(--font-dotdigital)' }}>
                  RUN DATE: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '24px', color: 'var(--color-ghost-white)', marginBottom: '4px' }}>
                  {activeAccount.name}
                </h2>
                <span className={`status-badge ${activeAccount.status.toLowerCase()}`}>
                  Account Status: {activeAccount.status}
                </span>
                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)', marginTop: '8px' }}>
                  Industry: {activeAccount.industry || 'N/A'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ background: 'var(--color-fog)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-silver-mist)' }}>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Total Projects</div>
                <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)', marginTop: '4px' }}>
                  {accountReportData.totalProjects}
                </div>
              </div>
              <div style={{ background: 'var(--color-fog)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-silver-mist)' }}>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Completed Projects</div>
                <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: '#248a3d', marginTop: '4px' }}>
                  {accountReportData.completedProjects.length}
                </div>
              </div>
              <div style={{ background: 'var(--color-fog)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-silver-mist)' }}>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Ongoing Pipelines</div>
                <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-cobalt-link)', marginTop: '4px' }}>
                  {accountReportData.ongoingProjects.length}
                </div>
              </div>
              <div style={{ background: 'var(--color-fog)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-silver-mist)' }}>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Avg Progress Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-dotdigital)', color: 'var(--color-celestial-light)', marginTop: '4px' }}>
                  {accountReportData.avgCompletion}%
                </div>
              </div>
            </div>

            {/* Account Details & Main Contacts Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              {/* Account Address Card */}
              <div>
                <h3 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', borderBottom: '1px solid var(--color-silver-mist)', paddingBottom: '8px', marginBottom: '12px' }}>
                  Account Information
                </h3>
                <div style={{ fontSize: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeAccount.phone && <div><strong>Phone:</strong> {activeAccount.phone}</div>}
                  {activeAccount.email && <div><strong>Email:</strong> {activeAccount.email}</div>}
                  {activeAccount.website && <div><strong>Website:</strong> {activeAccount.website}</div>}
                  {(activeAccount.street || activeAccount.city) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      <strong>Address:</strong>
                      <span style={{ color: 'var(--color-whisper-blue)' }}>
                        {activeAccount.street}<br />
                        {activeAccount.city}, {activeAccount.state} {activeAccount.postalCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Contacts list */}
              <div>
                <h3 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', borderBottom: '1px solid var(--color-silver-mist)', paddingBottom: '8px', marginBottom: '12px' }}>
                  Account Contacts ({accountReportData.contacts.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {accountReportData.contacts.length > 0 ? (
                    accountReportData.contacts.map(c => (
                      <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-caption)' }}>
                        <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
                        <span style={{ color: 'var(--color-whisper-blue)' }}>{c.jobTitle} &bull; {c.email}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-whisper-blue)' }}>No contacts connected to this account.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Project Status Portfolios (Ongoing and Completed) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-ghost-white)', borderBottom: '1px solid var(--color-silver-mist)', paddingBottom: '8px' }}>
                Project Portfolio Details
              </h3>

              {/* Ongoing Projects */}
              <div>
                <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-celestial-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> Active & Planned Pipelines ({accountReportData.ongoingProjects.length})
                </h4>

                {accountReportData.ongoingProjects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {accountReportData.ongoingProjects.map(proj => (
                      <div key={proj.id} style={{
                        background: 'var(--color-fog)',
                        border: '1px solid var(--color-silver-mist)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500, fontSize: 'var(--text-body-lg)' }}>
                            {proj.name}
                          </span>
                          <span className={`status-badge ${proj.status.toLowerCase().replace(' ', '-')}`}>
                            {proj.status}
                          </span>
                        </div>
                        {proj.summary && <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-comet)' }}>{proj.summary}</p>}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Progress:</span>
                          <div style={{ flexGrow: 1, height: '6px', background: 'var(--color-silver-mist)', borderRadius: '3px', overflow: 'hidden', maxWidth: '300px' }}>
                            <div style={{ width: `${proj.percentageComplete}%`, height: '100%', background: 'var(--color-neon-violet)' }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-dotdigital)', fontSize: 'var(--text-caption)', color: 'var(--color-ghost-white)' }}>
                            {proj.percentageComplete}%
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)', marginTop: '2px' }}>
                          <span>Start Date: {proj.startDate || 'N/A'}</span>
                          <span>Target Date: {proj.targetDate || 'N/A'}</span>
                          <span>Project Owner: {proj.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-whisper-blue)' }}>No active projects on file.</p>
                )}
              </div>

              {/* Completed Projects */}
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: 'var(--text-body-lg)', color: '#248a3d', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Completed Pipelines ({accountReportData.completedProjects.length})
                </h4>

                {accountReportData.completedProjects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {accountReportData.completedProjects.map(proj => (
                      <div key={proj.id} style={{
                        background: 'var(--color-fog)',
                        border: '1px solid rgba(52, 211, 153, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500 }}>
                            {proj.name}
                          </span>
                          <span style={{ color: '#248a3d', fontSize: 'var(--text-caption)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> Completed
                          </span>
                        </div>
                        {proj.summary && <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-whisper-blue)' }}>{proj.summary}</p>}
                        <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)', marginTop: '4px' }}>
                          <span>Start Date: {proj.startDate}</span>
                          <span>Completion Date: {proj.targetDate}</span>
                          <span>Delivered by: {proj.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-whisper-blue)' }}>No completed projects on file.</p>
                )}
              </div>
            </div>

            {/* Linked Systems / Assets */}
            <div>
              <h3 style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-ghost-white)', borderBottom: '1px solid var(--color-silver-mist)', paddingBottom: '8px', marginBottom: '16px' }}>
                Account Systems & Integrations ({accountReportData.assets.length})
              </h3>
              
              {accountReportData.assets.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {accountReportData.assets.map(asset => (
                    <div key={asset.id} style={{
                      background: 'var(--color-fog)',
                      border: '1px solid var(--color-silver-mist)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--color-ghost-white)', fontWeight: 500, fontSize: 'var(--text-body)' }}>{asset.name}</span>
                        <span className="status-badge" style={{ fontSize: '9px' }}>{asset.serviceProvider}</span>
                      </div>
                      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>{asset.notes || 'No notes.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-whisper-blue)' }}>No active systems mapped to this account.</p>
              )}
            </div>

            {/* Signature / System Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--color-silver-mist)',
              paddingTop: '20px',
              marginTop: '12px',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-interstellar-gray)'
            }}>
              <span>Workflow Zero CRM (Cloudflare SPA Port)</span>
              <span>Secure Internal Document</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glassy-card" style={{
          padding: '60px',
          textAlign: 'center',
          color: 'var(--color-whisper-blue)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FileText size={48} style={{ color: 'var(--color-storm-gray)' }} />
          <div>Select an active client account from the dropdown above to run and compile their CRM progress report.</div>
        </div>
      )}
    </div>
  );
};
