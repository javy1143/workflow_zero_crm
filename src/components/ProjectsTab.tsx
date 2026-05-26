import React, { useState, useMemo } from 'react';
import { Project, Account, Contact } from '../types';
import { Plus, Search, Filter, Calendar, User, Building, Compass, Edit3, X } from 'lucide-react';

interface ProjectsTabProps {
  projects: Project[];
  accounts: Account[];
  contacts: Contact[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  accounts,
  contacts,
  onAddProject,
  onUpdateProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [accountFilter, setAccountFilter] = useState<string>('ALL');
  const [minCompletion, setMinCompletion] = useState<number>(0);
  const [maxCompletion, setMaxCompletion] = useState<number>(100);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Add Project form states
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<'Planning' | 'In Progress' | 'On Hold' | 'Completed'>('Planning');
  const [accountId, setAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [percentageComplete, setPercentageComplete] = useState<number>(0);
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Project form states
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editStatus, setEditStatus] = useState<'Planning' | 'In Progress' | 'On Hold' | 'Completed'>('Planning');
  const [editAccountId, setEditAccountId] = useState('');
  const [editContactId, setEditContactId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editPercentageComplete, setEditPercentageComplete] = useState<number>(0);
  const [editSummary, setEditSummary] = useState('');
  const [updating, setUpdating] = useState(false);

  // Filter contacts in new project modal depending on selected account
  const modalFilteredContacts = useMemo(() => {
    if (!accountId) return [];
    return contacts.filter(c => c.accountId === accountId);
  }, [accountId, contacts]);

  // Filter contacts in edit project modal depending on selected account
  const editModalFilteredContacts = useMemo(() => {
    if (!editAccountId) return [];
    return contacts.filter(c => c.accountId === editAccountId);
  }, [editAccountId, contacts]);

  // Default sorting: default list should be sorted by completion percentage
  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter(project => {
        const linkedAccount = accounts.find(a => a.id === project.accountId);
        const matchesSearch = 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          linkedAccount?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
        const matchesAccount = accountFilter === 'ALL' || project.accountId === accountFilter;
        const matchesCompletion = 
          project.percentageComplete >= minCompletion && 
          project.percentageComplete <= maxCompletion;

        return matchesSearch && matchesStatus && matchesAccount && matchesCompletion;
      })
      .sort((a, b) => b.percentageComplete - a.percentageComplete);
  }, [projects, accounts, searchTerm, statusFilter, accountFilter, minCompletion, maxCompletion]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setEditName(project.name);
    setEditOwner(project.owner);
    setEditStatus(project.status);
    setEditAccountId(project.accountId);
    setEditContactId(project.contactId);
    setEditStartDate(project.startDate);
    setEditTargetDate(project.targetDate);
    setEditPercentageComplete(project.percentageComplete);
    setEditSummary(project.summary);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner || !accountId || !contactId) return;
    setSubmitting(true);
    try {
      await onAddProject({
        name,
        owner,
        status,
        accountId,
        contactId,
        startDate,
        targetDate,
        percentageComplete,
        summary
      });
      // Clear form
      setName('');
      setOwner('');
      setStatus('Planning');
      setAccountId('');
      setContactId('');
      setStartDate('');
      setTargetDate('');
      setPercentageComplete(0);
      setSummary('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editName || !editOwner || !editAccountId || !editContactId) return;
    setUpdating(true);
    try {
      await onUpdateProject(selectedProject.id, {
        name: editName,
        owner: editOwner,
        status: editStatus,
        accountId: editAccountId,
        contactId: editContactId,
        startDate: editStartDate,
        targetDate: editTargetDate,
        percentageComplete: editPercentageComplete,
        summary: editSummary
      });
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Project Portfolio
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Click on any project card below to modify status, deliverables summary, or completion percentage.
          </p>
        </div>
        <button className="btn-primary-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filter Control Board */}
      <div className="glassy-card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-whisper-blue)'
            }} />
            <input
              type="text"
              className="input-minimal"
              placeholder="Search projects by name, owner, summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: 'var(--color-whisper-blue)' }} />
            <select
              className="input-minimal"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '130px', padding: '8px 10px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Account Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="input-minimal"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              style={{ width: '180px', padding: '8px 10px' }}
            >
              <option value="ALL">All Clients</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Completion Range Slider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-arctic-mist)',
          borderTop: '1px solid rgba(186, 215, 247, 0.04)',
          paddingTop: '12px'
        }}>
          <span>Completion Range:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, maxWidth: '400px' }}>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={minCompletion} 
              onChange={(e) => setMinCompletion(Number(e.target.value))}
              style={{ flexGrow: 1, accentColor: 'var(--color-neon-violet)' }}
            />
            <span style={{ fontFamily: 'var(--font-dotdigital)', width: '36px', textAlign: 'center' }}>{minCompletion}%</span>
            <span>to</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={maxCompletion} 
              onChange={(e) => setMaxCompletion(Number(e.target.value))}
              style={{ flexGrow: 1, accentColor: 'var(--color-neon-violet)' }}
            />
            <span style={{ fontFamily: 'var(--font-dotdigital)', width: '36px', textAlign: 'center' }}>{maxCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAndSortedProjects.length > 0 ? (
          filteredAndSortedProjects.map(project => {
            const linkedAccount = accounts.find(a => a.id === project.accountId);
            const linkedContact = contacts.find(c => c.id === project.contactId);
            return (
              <div 
                key={project.id} 
                className="glassy-card clickable-card" 
                onClick={() => handleSelectProject(project)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative'
                }}
              >
                {/* Visual Edit indicator */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-whisper-blue)', opacity: 0.5 }}>
                  <Edit3 size={14} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', paddingRight: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-ghost-white)' }}>
                      {project.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px', fontSize: 'var(--text-caption)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-arctic-mist)' }}>
                        <Building size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                        {linkedAccount?.name || 'Unknown Client'}
                      </span>
                      {linkedContact && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-comet)' }}>
                          <User size={12} style={{ color: 'var(--color-whisper-blue)' }} />
                          {linkedContact.firstName} {linkedContact.lastName} ({linkedContact.jobTitle})
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-whisper-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Compass size={12} />
                      Owner: {project.owner}
                    </span>
                  </div>
                </div>

                {project.summary && (
                  <p style={{
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-comet)',
                    background: 'rgba(5, 6, 15, 0.3)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(186, 215, 247, 0.03)'
                  }}>
                    {project.summary}
                  </p>
                )}

                {/* Progress bar and Dates details */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderTop: '1px solid rgba(186, 215, 247, 0.04)',
                  paddingTop: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, maxWidth: '400px' }}>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>Progress:</span>
                    <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${project.percentageComplete}%`,
                        height: '100%',
                        background: project.status === 'Completed' ? '#34d399' : 'var(--color-neon-violet)',
                        borderRadius: '3px'
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)', minWidth: '32px' }}>
                      {project.percentageComplete}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      Start: {project.startDate || 'N/A'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-celestial-light)' }}>
                      <Calendar size={12} />
                      Target: {project.targetDate || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glassy-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-whisper-blue)' }}>
            No projects match the selected filters.
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 6, 15, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="login-card" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '95vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Create New Project</h3>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Project Name*</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Project Owner (Author)*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Status</label>
                  <select
                    className="input-minimal"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Client Account*</label>
                  <select
                    className="input-minimal"
                    value={accountId}
                    onChange={(e) => {
                      setAccountId(e.target.value);
                      setContactId(''); // Reset primary contact
                    }}
                    required
                  >
                    <option value="">-- Select Client --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Primary Contact*</label>
                  <select
                    className="input-minimal"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    required
                    disabled={!accountId}
                  >
                    <option value="">
                      {!accountId ? 'Select a client first' : '-- Select Contact --'}
                    </option>
                    {modalFilteredContacts.map(con => (
                      <option key={con.id} value={con.id}>
                        {con.firstName} {con.lastName} ({con.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Start Date</label>
                  <input
                    type="date"
                    className="input-minimal"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Target Date</label>
                  <input
                    type="date"
                    className="input-minimal"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Percentage Complete</label>
                  <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{percentageComplete}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="input-minimal"
                  value={percentageComplete}
                  onChange={(e) => setPercentageComplete(Number(e.target.value))}
                  style={{ accentColor: 'var(--color-neon-violet)', padding: '4px 0' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Summary / Description</label>
                <textarea
                  className="input-minimal"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize the project deliverables and milestones..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-secondary-outline" 
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-solid-primary" 
                  disabled={submitting}
                  style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontSize: 'var(--text-body)' }}
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 6, 15, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="login-card" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '95vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Edit Project Details</h3>
              <button onClick={() => setSelectedProject(null)} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={14} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Project Name*</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Project Owner*</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={editOwner}
                    onChange={(e) => setEditOwner(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Status</label>
                  <select
                    className="input-minimal"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Client Account*</label>
                  <select
                    className="input-minimal"
                    value={editAccountId}
                    onChange={(e) => {
                      setEditAccountId(e.target.value);
                      setEditContactId(''); // Reset contact selection
                    }}
                    required
                  >
                    <option value="">-- Select Client --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Primary Contact*</label>
                  <select
                    className="input-minimal"
                    value={editContactId}
                    onChange={(e) => setEditContactId(e.target.value)}
                    required
                    disabled={!editAccountId}
                  >
                    <option value="">
                      {!editAccountId ? 'Select a client first' : '-- Select Contact --'}
                    </option>
                    {editModalFilteredContacts.map(con => (
                      <option key={con.id} value={con.id}>
                        {con.firstName} {con.lastName} ({con.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Start Date</label>
                  <input
                    type="date"
                    className="input-minimal"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Target Date</label>
                  <input
                    type="date"
                    className="input-minimal"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Percentage Complete</label>
                  <span style={{ fontFamily: 'var(--font-dotdigital)', color: 'var(--color-ghost-white)' }}>{editPercentageComplete}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="input-minimal"
                  value={editPercentageComplete}
                  onChange={(e) => setEditPercentageComplete(Number(e.target.value))}
                  style={{ accentColor: 'var(--color-neon-violet)', padding: '4px 0' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Summary / Description</label>
                <textarea
                  className="input-minimal"
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-secondary-outline" 
                  onClick={() => setSelectedProject(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-solid-primary" 
                  disabled={updating}
                  style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontSize: 'var(--text-body)' }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
