import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpDown, Check, ChevronDown, ChevronUp, Columns3, Filter, Plus, Search, Trash2 } from 'lucide-react';

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

type SortDirection = 'asc' | 'desc';

type BoardColumn<T> = {
  key: keyof T & string;
  label: string;
};

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

const boardStorageKey = (title: string) => `record-board-columns-${slug(title)}`;

const uniqueKeys = <T,>(keys: (keyof T & string | undefined)[]) => {
  const seen = new Set<string>();
  return keys.filter((key): key is keyof T & string => {
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeSortValue = (value: unknown) => {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim();
  if (!text) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const timestamp = Date.parse(text);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  if (/^-?\$?[\d,]+(\.\d+)?$/.test(text)) {
    return Number(text.replace(/[$,]/g, ''));
  }

  return text.toLowerCase();
};

const compareValues = (a: unknown, b: unknown) => {
  const first = normalizeSortValue(a);
  const second = normalizeSortValue(b);

  if (typeof first === 'number' && typeof second === 'number') return first - second;
  return String(first).localeCompare(String(second), undefined, { numeric: true, sensitivity: 'base' });
};

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
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<(keyof T & string)[]>([]);
  const [sortState, setSortState] = useState<{ key: keyof T & string; direction: SortDirection }>({
    key: primaryField,
    direction: 'asc'
  });

  useEffect(() => {
    if (!showAddModal && !selectedRecord) {
      setFormData({ ...defaultRecord });
      setError(null);
    }
  }, [defaultRecord, showAddModal, selectedRecord]);

  const allColumns = useMemo<BoardColumn<T>[]>(() => {
    const fieldColumns = fields.map(field => ({ key: field.key, label: field.label }));
    if (fieldColumns.some(column => column.key === 'createdAt')) return fieldColumns;
    return [...fieldColumns, { key: 'createdAt' as keyof T & string, label: 'Created' }];
  }, [fields]);

  const defaultColumnKeys = useMemo(() => {
    const preferred = uniqueKeys<T>([primaryField, badgeField, ...secondaryFields]);
    const validColumnKeys = new Set(allColumns.map(column => column.key));
    return preferred.filter(key => validColumnKeys.has(key));
  }, [allColumns, badgeField, primaryField, secondaryFields]);

  useEffect(() => {
    const key = boardStorageKey(title);
    const validColumnKeys = new Set(allColumns.map(column => column.key));

    try {
      const saved = window.localStorage.getItem(key);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        const restored = parsed.filter((columnKey): columnKey is keyof T & string =>
          typeof columnKey === 'string' && validColumnKeys.has(columnKey as keyof T & string)
        );
        setVisibleColumnKeys(restored.length ? restored : defaultColumnKeys);
        return;
      }
    } catch {
      // Local storage is optional; fall back to the tab defaults.
    }

    setVisibleColumnKeys(defaultColumnKeys);
  }, [allColumns, defaultColumnKeys, title]);

  useEffect(() => {
    if (visibleColumnKeys.length === 0) return;
    window.localStorage.setItem(boardStorageKey(title), JSON.stringify(visibleColumnKeys));
  }, [title, visibleColumnKeys]);

  useEffect(() => {
    if (visibleColumnKeys.length > 0 && !visibleColumnKeys.includes(sortState.key)) {
      setSortState({ key: visibleColumnKeys[0], direction: 'asc' });
    }
  }, [sortState.key, visibleColumnKeys]);

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

  const visibleColumns = useMemo(() => {
    const fallback = defaultColumnKeys.length ? defaultColumnKeys : [primaryField];
    const selectedKeys = visibleColumnKeys.length ? visibleColumnKeys : fallback;
    return allColumns.filter(column => selectedKeys.includes(column.key));
  }, [allColumns, defaultColumnKeys, primaryField, visibleColumnKeys]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((firstRecord, secondRecord) => {
      const firstRaw = firstRecord[sortState.key];
      const secondRaw = secondRecord[sortState.key];
      const firstValue = getRelatedLabel ? getRelatedLabel(sortState.key, firstRaw) || firstRaw : firstRaw;
      const secondValue = getRelatedLabel ? getRelatedLabel(sortState.key, secondRaw) || secondRaw : secondRaw;
      const result = compareValues(firstValue, secondValue);
      return sortState.direction === 'asc' ? result : -result;
    });
  }, [filteredRecords, getRelatedLabel, sortState]);

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

  const toggleSort = (key: keyof T & string) => {
    setSortState(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumn = (key: keyof T & string) => {
    setVisibleColumnKeys(prev => {
      if (prev.includes(key)) {
        return prev.length === 1 ? prev : prev.filter(columnKey => columnKey !== key);
      }
      return [...prev, key];
    });
  };

  const resolveDisplayValue = (record: T, key: keyof T & string) => {
    const rawValue = record[key];
    return getRelatedLabel ? getRelatedLabel(key, rawValue) || rawValue : rawValue;
  };

  const renderCellValue = (record: T, key: keyof T & string) => {
    const value = resolveDisplayValue(record, key);
    const text = String(value ?? '').trim();

    if (key === badgeField && text) {
      return <span className={`status-badge ${slug(text)}`}>{text}</span>;
    }

    if (key === primaryField) {
      return <strong className="record-primary">{text || 'Untitled record'}</strong>;
    }

    return <span className={!text ? 'muted-cell' : undefined}>{text || 'Not set'}</span>;
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
        <div className="column-picker">
          <button
            className="btn-secondary-outline column-picker-trigger"
            type="button"
            onClick={() => setColumnPickerOpen(prev => !prev)}
            aria-expanded={columnPickerOpen}
          >
            <Columns3 size={14} />
            <span>Columns</span>
            <ChevronDown size={14} />
          </button>
          {columnPickerOpen && (
            <div className="column-menu">
              {allColumns.map(column => {
                const checked = visibleColumnKeys.includes(column.key);
                return (
                  <label key={column.key} className="column-option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(column.key)}
                    />
                    <span className="column-check">{checked && <Check size={12} />}</span>
                    <span>{column.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sortedRecords.length > 0 ? (
        <div className="table-container record-table-shell">
          <table className="crm-table record-table">
            <thead>
              <tr>
                {visibleColumns.map(column => {
                  const active = sortState.key === column.key;
                  return (
                    <th key={column.key}>
                      <button
                        className={`sort-button ${active ? 'active' : ''}`}
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        aria-label={`Sort by ${column.label}`}
                      >
                        <span>{column.label}</span>
                        {active ? (
                          sortState.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </button>
                    </th>
                  );
                })}
                {renderCardActions && <th className="record-actions-heading">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map(record => (
                <tr
                  key={record.id}
                  className="clickable-row"
                  tabIndex={0}
                  onClick={() => openEdit(record)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openEdit(record);
                    }
                  }}
                  aria-label={`Open ${String(record[primaryField] || 'record')}`}
                >
                  {visibleColumns.map(column => (
                    <td key={column.key}>{renderCellValue(record, column.key)}</td>
                  ))}
                  {renderCardActions && (
                    <td className="record-table-actions" onClick={(event) => event.stopPropagation()}>
                      {renderCardActions(record)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
          <div className="glassy-card empty-state">No records match the current view.</div>
      )}

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
