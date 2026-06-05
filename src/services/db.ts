import { firestore } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc
} from 'firebase/firestore';
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

const getCollection = async <T>(collectionName: string): Promise<T[]> => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  const records: T[] = [];
  querySnapshot.forEach((docSnap: any) => {
    records.push({ id: docSnap.id, ...docSnap.data() } as T);
  });
  return records;
};

const addRecord = async <T extends { id: string; createdAt: string }>(
  collectionName: string,
  payload: Omit<T, 'id' | 'createdAt'>
): Promise<T> => {
  const createdAt = new Date().toISOString();
  const docRef = await addDoc(collection(firestore, collectionName), {
    ...payload,
    createdAt
  });
  return {
    ...payload,
    id: docRef.id,
    createdAt
  } as T;
};

const updateRecord = async <T>(
  collectionName: string,
  id: string,
  updates: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(firestore, collectionName, id);
  await updateDoc(docRef, updates);
};

const deleteRecord = async (collectionName: string, id: string): Promise<void> => {
  const docRef = doc(firestore, collectionName, id);
  await deleteDoc(docRef);
};

// Unified Db Service
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
    await deleteRecord('accounts', id);
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
    await deleteRecord('contacts', id);
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
    await deleteRecord('projects', id);
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
    await deleteRecord('assets', id);
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
    await deleteRecord('vendors', id);
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
    await deleteRecord('automations', id);
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
    await deleteRecord('tasks', id);
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
    await deleteRecord('supportTickets', id);
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
    await deleteRecord('reports', id);
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
    await deleteRecord('billingContracts', id);
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
    await deleteRecord('adminSettings', id);
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    return getCollection<Activity>('activities');
  },

  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const timestamp = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'activities'), {
      ...activity,
      timestamp
    });
    return {
      ...activity,
      id: docRef.id,
      timestamp
    };
  },

  async deleteActivity(id: string): Promise<void> {
    await deleteRecord('activities', id);
  }
};
