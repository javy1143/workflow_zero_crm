import React, { useState, useMemo } from 'react';
import { Vendor } from '../types';
import { Plus, Search, Filter, Globe, Mail, Phone, BookOpen } from 'lucide-react';

interface VendorsTabProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<void>;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({ vendors, onAddVendor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get unique categories for dropdown
  const categories = useMemo(() => {
    const list = vendors.map(v => v.category).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list))];
  }, [vendors]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || vendor.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [vendors, searchTerm, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      await onAddVendor({
        name,
        category,
        website,
        supportEmail,
        supportPhone,
        notes
      });
      // Clear form
      setName('');
      setCategory('');
      setWebsite('');
      setSupportEmail('');
      setSupportPhone('');
      setNotes('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-heading-lg)', fontFamily: 'var(--font-aeonikpro)' }}>
            Vendor & Partner Directory
          </h2>
          <p style={{ color: 'var(--color-whisper-blue)', fontSize: 'var(--text-body)', marginTop: '4px' }}>
            Reference directory of active partners and third-party utility vendors.
          </p>
        </div>
        <button className="btn-primary-pill" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter Control Board */}
      <div className="glassy-card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        padding: '16px'
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
            placeholder="Search vendors by name, notes, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--color-whisper-blue)' }} />
          <select
            className="input-minimal"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '185px', padding: '8px 10px' }}
          >
            <option value="ALL">All Categories</option>
            {categories.filter(cat => cat !== 'ALL').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <div key={vendor.id} className="glassy-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-ghost-white)', fontWeight: 500 }}>
                    {vendor.name}
                  </h4>
                  {vendor.category && (
                    <span className="status-badge" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                      {vendor.category}
                    </span>
                  )}
                </div>
                {vendor.website && (
                  <a 
                    href={vendor.website} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: 'var(--text-caption)', color: 'var(--color-celestial-light)', marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Globe size={11} />
                    {vendor.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
              </div>

              {vendor.notes && (
                <p style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-comet)',
                  background: 'rgba(5, 6, 15, 0.2)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(186, 215, 247, 0.03)'
                }}>
                  {vendor.notes}
                </p>
              )}

              {/* Vendor Contacts */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '1px solid rgba(186, 215, 247, 0.04)',
                paddingTop: '12px',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-whisper-blue)'
              }}>
                <span style={{ fontWeight: 500, color: 'var(--color-arctic-mist)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={12} /> Support Channels
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
                  {vendor.supportEmail && (
                    <a href={`mailto:${vendor.supportEmail}`} style={{ color: 'var(--color-comet)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={11} /> {vendor.supportEmail}
                    </a>
                  )}
                  {vendor.supportPhone && (
                    <a href={`tel:${vendor.supportPhone}`} style={{ color: 'var(--color-comet)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={11} /> {vendor.supportPhone}
                    </a>
                  )}
                  {!vendor.supportEmail && !vendor.supportPhone && (
                    <span>No direct support details on file.</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-whisper-blue)' }}>
            No vendors match the selected filters.
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 'var(--text-heading)', fontFamily: 'var(--font-aeonikpro)' }}>Add Partner Vendor</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Vendor Name*</label>
                <input
                  type="text"
                  className="input-minimal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vercel Inc."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Category / Tag</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Hosting, DNS"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Website</label>
                  <input
                    type="url"
                    className="input-minimal"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://vercel.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Support Email</label>
                  <input
                    type="email"
                    className="input-minimal"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@vercel.com"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Support Phone</label>
                  <input
                    type="text"
                    className="input-minimal"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="555-0100"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-caption)', color: 'var(--color-arctic-mist)' }}>Partner Notes / SLA details</label>
                <textarea
                  className="input-minimal"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Primary services, SLA requirements, contact windows..."
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
                  {submitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
