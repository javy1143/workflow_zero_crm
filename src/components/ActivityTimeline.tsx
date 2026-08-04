import React from 'react';
import { Activity, Contact } from '../types';
import { Mail, Phone, MessageSquare, Clock, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  contacts: Contact[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, contacts }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={14} style={{ color: 'var(--color-celestial-light)' }} />;
      case 'call':
        return <Phone size={14} style={{ color: 'var(--color-azure-glow)' }} />;
      case 'text':
        return <MessageSquare size={14} style={{ color: 'var(--color-neon-violet)' }} />;
      default:
        return <Clock size={14} style={{ color: 'var(--color-arctic-mist)' }} />;
    }
  };

  const getDirectionBadge = (direction: 'inbound' | 'outbound') => {
    const isOutbound = direction === 'outbound';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '9px',
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 'var(--radius-full)',
        background: isOutbound ? 'rgba(36, 138, 61, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: isOutbound ? '#248a3d' : 'var(--color-caution)',
        border: `1px solid ${isOutbound ? 'rgba(36, 138, 61, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}>
        {isOutbound ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
        {direction}
      </span>
    );
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glassy-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{
          fontSize: 'var(--text-body-lg)',
          color: 'var(--color-ghost-white)',
          fontWeight: 600,
          fontFamily: 'var(--font-aeonikpro)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Interaction History</span>
          <span style={{
            fontSize: '11px',
            color: 'var(--color-whisper-blue)',
            background: 'var(--color-fog)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-silver-mist)'
          }}>
            {activities.length}
          </span>
        </h4>
      </div>

      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        paddingLeft: '16px',
        borderLeft: '2px solid var(--color-silver-mist)',
        marginLeft: '10px',
        marginTop: '8px'
      }}>
        {activities.length > 0 ? (
          activities.map((activity) => {
            const linkedContact = contacts.find(c => c.id === activity.contactId);
            return (
              <div key={activity.id} style={{ position: 'relative' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '-27px',
                  top: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--color-snow)',
                  border: '2px solid var(--color-silver-mist)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-ink)',
                  zIndex: 2,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {getIcon(activity.type)}
                </div>

                {/* Timeline content box */}
                <div style={{
                  background: 'var(--color-fog)',
                  border: '1px solid var(--color-silver-mist)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>
                  {/* Top header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-ghost-white)', fontSize: 'var(--text-body)' }}>
                        {activity.subject}
                      </span>
                      {getDirectionBadge(activity.direction)}
                    </div>
                    <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)', fontFamily: 'var(--font-sf-pro-text)' }}>
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  {/* Association metadata row */}
                  {(linkedContact || activity.metadata) && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '11px',
                      color: 'var(--color-whisper-blue)',
                      background: 'rgba(210, 210, 215, 0.12)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(210, 210, 215, 0.08)'
                    }}>
                      {linkedContact && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <strong>Contact:</strong> {linkedContact.firstName} {linkedContact.lastName}
                        </span>
                      )}
                      {activity.metadata?.emailAddress && (
                        <span><strong>To/From:</strong> {activity.metadata.emailAddress}</span>
                      )}
                      {activity.metadata?.phoneNumber && (
                        <span><strong>Phone:</strong> {activity.metadata.phoneNumber}</span>
                      )}
                      {activity.metadata?.duration !== undefined && (
                        <span><strong>Duration:</strong> {activity.metadata.duration} min</span>
                      )}
                    </div>
                  )}

                  {/* Content details */}
                  <p style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-comet)',
                    lineHeight: '1.5',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sf-pro-text)'
                  }}>
                    {activity.content}
                  </p>

                  {/* Creator name footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    color: 'var(--color-interstellar-gray)',
                    borderTop: '1px solid rgba(210, 210, 215, 0.15)',
                    paddingTop: '8px',
                    marginTop: '2px'
                  }}>
                    <User size={10} />
                    <span>Logged by {activity.creatorName || 'System'}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '32px 0',
            color: 'var(--color-whisper-blue)',
            textAlign: 'center',
            left: '-16px',
            position: 'relative'
          }}>
            <Clock size={28} style={{ color: 'var(--color-silver-mist)' }} />
            <div>
              <span style={{ display: 'block', fontWeight: 500, fontSize: 'var(--text-body)', color: 'var(--color-ghost-white)' }}>
                No interactions logged
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-whisper-blue)' }}>
                Use the interaction panel above to log phone calls, emails, or texts.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
