import { apiRequest } from './api';
import {
  Account,
  Contact,
  Project,
  Asset,
  Vendor,
  Activity,
  Automation,
  Task,
  SupportTicket,
  Report,
  BillingContract,
  AdminSettings
} from '../types';

// Helper for localStorage fallback during standalone client-side dev
const getLocalRecords = <T>(collectionName: string): T[] => {
  try {
    const data = localStorage.getItem(`wfz_db_${collectionName}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalRecords = <T>(collectionName: string, records: T[]): void => {
  try {
    localStorage.setItem(`wfz_db_${collectionName}`, JSON.stringify(records));
  } catch {
    // localStorage full or unavailable
  }
};

const getCollection = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const data = await apiRequest<T[]>(`/api/data/${collectionName}`);
    if (Array.isArray(data)) {
      setLocalRecords(collectionName, data);
      return data;
    }
  } catch (err) {
    console.warn(`API fetch for ${collectionName} failed, using local storage cache:`, err);
  }
  return getLocalRecords<T>(collectionName);
};

const addRecord = async <T extends { id: string; createdAt?: string; timestamp?: string }>(
  collectionName: string,
  payload: any
): Promise<T> => {
  const timestamp = new Date().toISOString();
  const fullPayload = {
    ...payload,
    id: payload.id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: payload.createdAt || timestamp
  };

  try {
    const created = await apiRequest<T>(`/api/data/${collectionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload)
    });
    const currentLocal = getLocalRecords<T>(collectionName);
    setLocalRecords(collectionName, [created, ...currentLocal]);
    return created;
  } catch (err) {
    console.warn(`API add for ${collectionName} failed, saving to local storage:`, err);
    const currentLocal = getLocalRecords<T>(collectionName);
    const updated = [fullPayload as unknown as T, ...currentLocal];
    setLocalRecords(collectionName, updated);
    return fullPayload as unknown as T;
  }
};

const updateRecord = async <T extends { id: string }>(
  collectionName: string,
  id: string,
  updates: any
): Promise<void> => {
  try {
    await apiRequest<void>(`/api/data/${collectionName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn(`API update for ${collectionName} failed, updating local storage:`, err);
  }

  const currentLocal = getLocalRecords<T>(collectionName);
  const updated = currentLocal.map(item => item.id === id ? { ...item, ...updates } : item);
  setLocalRecords(collectionName, updated);
};

const deleteRecord = async <T extends { id: string }>(collectionName: string, id: string): Promise<void> => {
  try {
    await apiRequest<void>(`/api/data/${collectionName}/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn(`API delete for ${collectionName} failed, deleting from local storage:`, err);
  }

  const currentLocal = getLocalRecords<T>(collectionName);
  const updated = currentLocal.filter(item => item.id !== id);
  setLocalRecords(collectionName, updated);
};

// Unified Cloudflare Db Service
export const dbService = {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    return getCollection<Account>('accounts');
  },

  async addAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    return addRecord<Account>('accounts', account);
  },

  async updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Account>('accounts', id, updates);
  },

  async deleteAccount(id: string): Promise<void> {
    await deleteRecord<Account>('accounts', id);
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return getCollection<Contact>('contacts');
  },

  async addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    return addRecord<Contact>('contacts', contact);
  },

  async updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Contact>('contacts', id, updates);
  },

  async deleteContact(id: string): Promise<void> {
    await deleteRecord<Contact>('contacts', id);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return getCollection<Project>('projects');
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    return addRecord<Project>('projects', project);
  },

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Project>('projects', id, updates);
  },

  async deleteProject(id: string): Promise<void> {
    await deleteRecord<Project>('projects', id);
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    return getCollection<Asset>('assets');
  },

  async addAsset(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
    return addRecord<Asset>('assets', asset);
  },

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Asset>('assets', id, updates);
  },

  async deleteAsset(id: string): Promise<void> {
    await deleteRecord<Asset>('assets', id);
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return getCollection<Vendor>('vendors');
  },

  async addVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor> {
    return addRecord<Vendor>('vendors', vendor);
  },

  async updateVendor(id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Vendor>('vendors', id, updates);
  },

  async deleteVendor(id: string): Promise<void> {
    await deleteRecord<Vendor>('vendors', id);
  },

  // Automations
  async getAutomations(): Promise<Automation[]> {
    return getCollection<Automation>('automations');
  },

  async addAutomation(automation: Omit<Automation, 'id' | 'createdAt'>): Promise<Automation> {
    return addRecord<Automation>('automations', automation);
  },

  async updateAutomation(id: string, updates: Partial<Omit<Automation, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Automation>('automations', id, updates);
  },

  async deleteAutomation(id: string): Promise<void> {
    await deleteRecord<Automation>('automations', id);
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return getCollection<Task>('tasks');
  },

  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return addRecord<Task>('tasks', task);
  },

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Task>('tasks', id, updates);
  },

  async deleteTask(id: string): Promise<void> {
    await deleteRecord<Task>('tasks', id);
  },

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return getCollection<SupportTicket>('supportTickets');
  },

  async addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt'>): Promise<SupportTicket> {
    return addRecord<SupportTicket>('supportTickets', ticket);
  },

  async updateSupportTicket(id: string, updates: Partial<Omit<SupportTicket, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<SupportTicket>('supportTickets', id, updates);
  },

  async deleteSupportTicket(id: string): Promise<void> {
    await deleteRecord<SupportTicket>('supportTickets', id);
  },

  // Reports
  async getReports(): Promise<Report[]> {
    return getCollection<Report>('reports');
  },

  async addReport(report: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
    return addRecord<Report>('reports', report);
  },

  async updateReport(id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<Report>('reports', id, updates);
  },

  async deleteReport(id: string): Promise<void> {
    await deleteRecord<Report>('reports', id);
  },

  // Billing / Contracts
  async getBillingContracts(): Promise<BillingContract[]> {
    return getCollection<BillingContract>('billingContracts');
  },

  async addBillingContract(contract: Omit<BillingContract, 'id' | 'createdAt'>): Promise<BillingContract> {
    return addRecord<BillingContract>('billingContracts', contract);
  },

  async updateBillingContract(id: string, updates: Partial<Omit<BillingContract, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<BillingContract>('billingContracts', id, updates);
  },

  async deleteBillingContract(id: string): Promise<void> {
    await deleteRecord<BillingContract>('billingContracts', id);
  },

  // Settings / Admin
  async getAdminSettings(): Promise<AdminSettings[]> {
    return getCollection<AdminSettings>('adminSettings');
  },

  async addAdminSettings(settings: Omit<AdminSettings, 'id' | 'createdAt'>): Promise<AdminSettings> {
    return addRecord<AdminSettings>('adminSettings', settings);
  },

  async updateAdminSettings(id: string, updates: Partial<Omit<AdminSettings, 'id' | 'createdAt'>>): Promise<void> {
    await updateRecord<AdminSettings>('adminSettings', id, updates);
  },

  async deleteAdminSettings(id: string): Promise<void> {
    await deleteRecord<AdminSettings>('adminSettings', id);
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    return getCollection<Activity>('activities');
  },

  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const timestamp = new Date().toISOString();
    return addRecord<Activity>('activities', { ...activity, timestamp });
  },

  async deleteActivity(id: string): Promise<void> {
    await deleteRecord<Activity>('activities', id);
  }
};
