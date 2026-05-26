import { firestore } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc
} from 'firebase/firestore';
import { Account, Contact, Project, Asset, Vendor } from '../types';

// Unified Db Service
export const dbService = {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    const querySnapshot = await getDocs(collection(firestore, 'accounts'));
    const accounts: Account[] = [];
    querySnapshot.forEach((docSnap: any) => {
      accounts.push({ id: docSnap.id, ...docSnap.data() } as Account);
    });
    return accounts;
  },

  async addAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'accounts'), {
      ...account,
      createdAt
    });
    return {
      ...account,
      id: docRef.id,
      createdAt
    };
  },

  async updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(firestore, 'accounts', id);
    await updateDoc(docRef, updates);
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const querySnapshot = await getDocs(collection(firestore, 'contacts'));
    const contacts: Contact[] = [];
    querySnapshot.forEach((docSnap: any) => {
      contacts.push({ id: docSnap.id, ...docSnap.data() } as Contact);
    });
    return contacts;
  },

  async addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'contacts'), {
      ...contact,
      createdAt
    });
    return {
      ...contact,
      id: docRef.id,
      createdAt
    };
  },

  async updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(firestore, 'contacts', id);
    await updateDoc(docRef, updates);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(firestore, 'projects'));
    const projects: Project[] = [];
    querySnapshot.forEach((docSnap: any) => {
      projects.push({ id: docSnap.id, ...docSnap.data() } as Project);
    });
    return projects;
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'projects'), {
      ...project,
      createdAt
    });
    return {
      ...project,
      id: docRef.id,
      createdAt
    };
  },

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(firestore, 'projects', id);
    await updateDoc(docRef, updates);
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    const querySnapshot = await getDocs(collection(firestore, 'assets'));
    const assets: Asset[] = [];
    querySnapshot.forEach((docSnap: any) => {
      assets.push({ id: docSnap.id, ...docSnap.data() } as Asset);
    });
    return assets;
  },

  async addAsset(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'assets'), {
      ...asset,
      createdAt
    });
    return {
      ...asset,
      id: docRef.id,
      createdAt
    };
  },

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(firestore, 'assets', id);
    await updateDoc(docRef, updates);
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    const querySnapshot = await getDocs(collection(firestore, 'vendors'));
    const vendors: Vendor[] = [];
    querySnapshot.forEach((docSnap: any) => {
      vendors.push({ id: docSnap.id, ...docSnap.data() } as Vendor);
    });
    return vendors;
  },

  async addVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor> {
    const createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(firestore, 'vendors'), {
      ...vendor,
      createdAt
    });
    return {
      ...vendor,
      id: docRef.id,
      createdAt
    };
  },

  async updateVendor(id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(firestore, 'vendors', id);
    await updateDoc(docRef, updates);
  }
};
