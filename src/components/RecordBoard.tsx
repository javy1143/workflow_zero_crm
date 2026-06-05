import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit3, Filter, Plus, Search, Trash2 } from 'lucide-react';

export type FieldOption = string | { value: string; label: string };

export interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'url' | 'email';
  options?: FieldOption[];
  required?: boolean;
  section?: string;
  placeholder?: string;
}

export interface SummaryMetric {
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'cyan' | 'red' | 'neutral';
}

interface RecordBoardProps<T extends { id: string; createdAt: string }> {
  title: string;
  subtitle: string;
  addLabel: string;
  records: T[];
  fields: FieldConfig<T>[];
  defaultRecord: Omit<T, 'id' | 'createdAt'>;
  primaryField: keyof T & string;
  secondaryFields?: (keyof T & string)[];
  badgeField?: keyof T & string;
  filterField?: keyof T & string;
  filterLabel?: string;
  metrics?: SummaryMetric[];
  getRelatedLabel?: (field: string, value: unknown) => string;
  renderCardActions?: (record: T) => React.ReactNode;
  onAdd: (record: Omit<T, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const normalizeOption = (option: FieldOption) => (
  typeof option === 'string' ? { value: option, label: option } : option
);

const toneColor = (tone?: SummaryMetric['tone']) => {
  switch (tone) {
    case 'green':
      return '#248a3d';
    case 'cyan':
      return 'var(--wz-cyan)';
    case 'red':
      return 'var(--color-caution)';
    case 'neutral':
      return 'var(--color-graphite)';
    default:
      return 'var(--wz-blue)';
  }
};

const slug = (value: unknown) => String(value || 'empty').toLowerCase().replace(/\s+/g, '-');

export function RecordBoard<T extends { id: string; createdAt: string }>({
  title,
  subtitle,
  addLabel,
  records,
  fields,
  defaultRecord,
  primaryField,
  secondaryFields = [],
  badgeField,
  filterField,
  filterLabel = 'Filter',
  metrics = [],
  getRelatedLabel,
  renderCardActions,
  onAdd,
  onUpdate,
  onDelete
}: RecordBoardProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({ ...defaultRecord });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showAddModal && !selectedRecord) {
      setFormData({ ...defaultRecord });
      setError(null);
    }
  }, [defaultRecord, showAddModal, selectedRecord]);

  const filterOptions = useMemo(() => {
    if (!filterField) return [];
    return Array.from(new Set(records.map(record => String(record[filterField] || '')).filter(Boolean)));
  }, [filterField, records]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return records.filter(record => {
      const haystack = fields
        .map(field => {
          const value = record[field.key];
          const label = getRelatedLabel ? getRelatedLabel(field.key, value) : '';
          return `${value ?? ''} ${label}`;
        })
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = !filterField || filterValue === 'ALL' || String(record[filterField] || '') === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [fields, filterField, filterValue, getRelatedLabel, records, searchTerm]);

  const groupedFields = useMemo(() => {
    return fields.reduce<Record<string, FieldConfig<T>[]>>((groups, field) => {
      const section = field.section || 'Core Details';
      groups[section] = groups[section] || [];
      groups[section].push(field);
      return groups;
    }, {});
  }, [fields]);

  const openCreate = () => {
    setFormData({ ...defaultRecord });
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (record: T) => {
    setSelectedRecord(record);
    setFormData({ ...record });
    setError(null);
  };

  const closeEditor = () => {
    setShowAddModal(false);
    setSelectedRecord(null);
    setFormData({ ...defaultRecord });
    setError(null);
  };

  const updateField = (field: FieldConfig<T>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field.key]: field.type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...defaultRecord,
        ...(selectedRecord || {}),
        ...formData
      } as Record<string, any>;
      delete payload.id;
      delete payload.createdAt;

      if (selectedRecord) {
        await onUpdate(selectedRecord.id, payload as Partial<Omit<T, 'id' | 'createdAt'>>);
      } else {
        await onAdd(payload as Omit<T, 'id' | 'createdAt'>);
      }
      closeEditor();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to save this record.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSelectedRecord = async () => {
    if (!selectedRecord || !onDelete) return;
    const recordName = String(selectedRecord[primaryField] || 'this record');
    const confirmed = window.confirm(`Delete ${recordName}? This cannot be undone.`);
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await onDelete(selectedRecord.id);
      closeEditor();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to delete this record.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig<T>) => {
    const value = formData[field.key] ?? '';
    const sharedProps = {
      id: field.key,
      className: 'input-minimal',
      value,
      required: field.required,
      placeholder: field.placeholder,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        updateField(field, event.target.value)
    };

    if (field.type === 'textarea') {
      return <textarea {...sharedProps} rows={3} style={{ resize: 'vertical' }} />;
    }

    if (field.type === 'select') {
      return (
        <select {...sharedProps}>
          <option value="">Select...</option>
          {(field.options || []).map(option => {
            const normalized = normalizeOption(option);
            return (
              <option key={normalized.value} value={normalized.value}>
                {normalized.label}
              </option>
            );
          })}
        </select>
      );
    }

    return <input {...sharedProps} type={field.type || 'text'} />;
  };

  const editorOpen = showAddModal || selectedRecord;

  return (
    <div className="record-board">
      <div className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button className="btn-primary-pill" onClick={openCreate}>
          <Plus size={16} />
          <span>{addLabel}</span>
        </button>
      </div>

      {metrics.length > 0 && (
        <div className="metric-strip">
          {metrics.map(metric => (
            <div className="metric-tile" key={metric.label}>
              <span>{metric.label}</span>
              <strong style={{ color: toneColor(metric.tone) }}>{metric.value}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="glassy-card record-controls">
        <div className="search-wrap">
          <Search size={16} />
          <input
            className="input-minimal"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div>
        {filterField && (
          <div className="filter-wrap">
            <Filter size={14} />
            <select className="input-minimal" value={filterValue} onChange={(event) => setFilterValue(event.target.value)}>
              <option value="ALL">All {filterLabel}</option>
              {filterOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="record-grid">
        {filteredRecords.length > 0 ? filteredRecords.map(record => {
          const primary = record[primaryField];
          const badge = badgeField ? record[badgeField] : null;
          return (
            <div
              key={record.id}
              className="record-card"
              role="button"
              tabIndex={0}
              onClick={() => openEdit(record)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openEdit(record);
              }}
            >
              <span className="record-edit"><Edit3 size={14} /></span>
              <div>
                <h3>{String(primary || 'Untitled record')}</h3>
                {badge && <span className={`status-badge ${slug(badge)}`}>{String(badge)}</span>}
              </div>
              <dl>
                {secondaryFields.map(field => {
                  const config = fields.find(item => item.key === field);
                  const rawValue = record[field];
                  const value = getRelatedLabel ? getRelatedLabel(field, rawValue) || rawValue : rawValue;
                  return (
                    <div key={field}>
                      <dt>{config?.label || field}</dt>
                      <dd>{String(value || 'Not set')}</dd>
                    </div>
                  );
                })}
              </dl>
              {renderCardActions && (
                <div className="record-actions" onClick={(event) => event.stopPropagation()}>
                  {renderCardActions(record)}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="glassy-card empty-state">No records match the current view.</div>
        )}
      </div>

      {editorOpen && (
        <div className="modal-backdrop">
          <form className="login-card record-editor" onSubmit={submitForm}>
            <div className="modal-header">
              <div>
                <span className="status-badge">{selectedRecord ? 'Edit record' : 'New record'}</span>
                <h3>{selectedRecord ? String(selectedRecord[primaryField] || title) : addLabel}</h3>
              </div>
              <button className="btn-icon" type="button" onClick={closeEditor} title="Back">
                <ArrowLeft size={16} />
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            {Object.entries(groupedFields).map(([section, sectionFields]) => (
              <fieldset key={section}>
                <legend>{section}</legend>
                <div className="form-grid">
                  {sectionFields.map(field => (
                    <label key={field.key} className={field.type === 'textarea' ? 'span-2' : undefined}>
                      <span>{field.label}{field.required ? '*' : ''}</span>
                      {renderField(field)}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="form-actions">
              {selectedRecord && onDelete && (
                <button type="button" className="btn-danger-outline" onClick={deleteSelectedRecord} disabled={submitting}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
              <button type="button" className="btn-secondary-outline" onClick={closeEditor} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-solid-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
