import { firestore, authService } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc
} from 'firebase/firestore';
import { Account, Contact, Project, Asset, Vendor } from '../types';

// Mock seed data
const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Acme Corp',
    status: 'Active',
    industry: 'Technology',
    website: 'https://acme.com',
    phone: '555-0100',
    email: 'contact@acme.com',
    street: '123 Enterprise Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'acc-2',
    name: 'Nexus Labs',
    status: 'Active',
    industry: 'Biotechnology',
    website: 'https://nexuslabs.io',
    phone: '555-0200',
    email: 'info@nexuslabs.io',
    street: '456 Biotech Parkway',
    city: 'Boston',
    state: 'MA',
    postalCode: '02111',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'acc-3',
    name: 'Skyline Digital',
    status: 'Lead',
    industry: 'Marketing',
    website: 'https://skylinedigital.co',
    phone: '555-0300',
    email: 'hello@skylinedigital.co',
    street: '789 Creative Blvd',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'acc-4',
    name: 'Horizon Holdings',
    status: 'Inactive',
    industry: 'Finance',
    website: 'https://horizonholdings.com',
    phone: '555-0400',
    email: 'inquiries@horizonholdings.com',
    street: '55 Wall Street',
    city: 'New York',
    state: 'NY',
    postalCode: '10005',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_CONTACTS: Contact[] = [
  {
    id: 'con-1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@acme.com',
    phone: '555-0101',
    jobTitle: 'Director of IT',
    accountId: 'acc-1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'con-2',
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'b.jones@nexuslabs.io',
    phone: '555-0202',
    jobTitle: 'Chief Technology Officer',
    accountId: 'acc-2',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'con-3',
    firstName: 'Carol',
    lastName: 'White',
    email: 'carol@skylinedigital.co',
    phone: '555-0303',
    jobTitle: 'Creative Director',
    accountId: 'acc-3',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'con-4',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@acme.com',
    phone: '555-0102',
    jobTitle: 'Senior Infrastructure Engineer',
    accountId: 'acc-1',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Cloud Infrastructure Migration',
    owner: 'Alex Mercer',
    status: 'In Progress',
    accountId: 'acc-1',
    contactId: 'con-1',
    startDate: '2026-05-01',
    targetDate: '2026-08-15',
    percentageComplete: 65,
    summary: 'Migrating legacy on-prem servers to high-performance cloud nodes on AWS, including CI/CD setup and database cluster optimization.',
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-2',
    name: 'Customer Portal Integration',
    owner: 'Sarah Connor',
    status: 'Planning',
    accountId: 'acc-2',
    contactId: 'con-2',
    startDate: '2026-06-01',
    targetDate: '2026-09-30',
    percentageComplete: 15,
    summary: 'Designing and building a secure patient management dashboard linked to internal lab systems via RESTful APIs.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-3',
    name: 'Brand Strategy & SEO Redesign',
    owner: 'James Carter',
    status: 'In Progress',
    accountId: 'acc-3',
    contactId: 'con-3',
    startDate: '2026-05-10',
    targetDate: '2026-07-20',
    percentageComplete: 40,
    summary: 'Comprehensive brand revitalization, user flow optimization, and organic SEO engineering to capture high-value enterprise leads.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-4',
    name: 'IT Security Audit & Hardening',
    owner: 'Elena Rostova',
    status: 'Completed',
    accountId: 'acc-1',
    contactId: 'con-4',
    startDate: '2026-04-01',
    targetDate: '2026-05-15',
    percentageComplete: 100,
    summary: 'Full penetration testing, vulnerability patching, MFA enforcement, and access-token credential auditing for internal databases.',
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_ASSETS: Asset[] = [
  {
    id: 'ast-1',
    name: 'AWS Production Account',
    serviceProvider: 'AWS',
    details: 'Account ID: 1234-5678-9012\nIAM Role: WZ-CRM-Admin\nConsole: https://wz-acme.signin.aws.amazon.com/console',
    accountId: 'acc-1',
    status: 'Active',
    notes: 'Hosts primary application nodes and RDS database clusters. MFA required for root.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ast-2',
    name: 'Google Workspace Organization',
    serviceProvider: 'Google',
    details: 'Domain: acme.com\nAdmin Console: admin.google.com\nSubscription: Enterprise Plus',
    accountId: 'acc-1',
    status: 'Active',
    notes: 'Handles employee emails, Drive storage, and SSO configuration.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ast-3',
    name: 'Make.com Automation Workspace',
    serviceProvider: 'Make',
    details: 'Workspace ID: ws_987654\nWebhooks Active: 14\nPrimary Scenarios: Leads sync, invoicing automation',
    accountId: 'acc-3',
    status: 'Active',
    notes: 'Powers background sync flows between HubSpot, email forms, and local databases.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ast-4',
    name: 'OpenAI API Workspace',
    serviceProvider: 'OpenAI',
    details: 'Org ID: org-skyline2026\nAPI Key: sk-proj-...xxxx\nRate Limit Tier: Tier 3',
    accountId: 'acc-3',
    status: 'Testing',
    notes: 'Used for GPT-4o customer support agents sandbox testing.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    name: 'Cloudflare Inc.',
    category: 'Cloud Hosting & CDN',
    website: 'https://cloudflare.com',
    supportEmail: 'support@cloudflare.com',
    supportPhone: '1-800-555-0111',
    notes: 'Provides DNS, SSL, WAF, Pages hosting, and Workers serverless execution.',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ven-2',
    name: 'GitHub Inc.',
    category: 'Software Development',
    website: 'https://github.com',
    supportEmail: 'support@github.com',
    supportPhone: '1-800-555-0222',
    notes: 'Repository hosting, GitHub Actions CI/CD automation, and dependency checking.',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ven-3',
    name: 'SendGrid',
    category: 'Email Delivery Service',
    website: 'https://sendgrid.com',
    supportEmail: 'support@sendgrid.com',
    supportPhone: '1-888-555-0333',
    notes: 'Handles transactional email delivery, onboarding sequences, and weekly digests.',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// LocalStorage helpers
const getLocal = <T>(key: string, seed: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
};

const setLocal = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Unified Db Service
export const dbService = {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    if (!authService.isDemo() && firestore) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'accounts'));
        const accounts: Account[] = [];
        querySnapshot.forEach((doc) => {
          accounts.push({ id: doc.id, ...doc.data() } as Account);
        });
        return accounts;
      } catch (e) {
        console.error("Firestore read error, using localStorage fallback", e);
      }
    }
    return getLocal<Account>('wf_crm_accounts', SEED_ACCOUNTS);
  },

  async addAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: 'acc-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    if (!authService.isDemo() && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'accounts'), {
          name: newAccount.name,
          status: newAccount.status,
          industry: newAccount.industry,
          website: newAccount.website,
          phone: newAccount.phone,
          email: newAccount.email,
          street: newAccount.street,
          city: newAccount.city,
          state: newAccount.state,
          postalCode: newAccount.postalCode,
          createdAt: newAccount.createdAt
        });
        newAccount.id = docRef.id;
        return newAccount;
      } catch (e) {
        console.error("Firestore write error, using localStorage fallback", e);
      }
    }

    const accounts = getLocal<Account>('wf_crm_accounts', SEED_ACCOUNTS);
    accounts.push(newAccount);
    setLocal('wf_crm_accounts', accounts);
    return newAccount;
  },

  async updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<void> {
    if (!authService.isDemo() && firestore) {
      try {
        const docRef = doc(firestore, 'accounts', id);
        await updateDoc(docRef, updates);
        return;
      } catch (e) {
        console.error("Firestore update error, using localStorage fallback", e);
      }
    }

    const accounts = getLocal<Account>('wf_crm_accounts', SEED_ACCOUNTS);
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      setLocal('wf_crm_accounts', accounts);
    }
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    if (!authService.isDemo() && firestore) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'contacts'));
        const contacts: Contact[] = [];
        querySnapshot.forEach((doc) => {
          contacts.push({ id: doc.id, ...doc.data() } as Contact);
        });
        return contacts;
      } catch (e) {
        console.error("Firestore read error, using localStorage fallback", e);
      }
    }
    return getLocal<Contact>('wf_crm_contacts', SEED_CONTACTS);
  },

  async addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: 'con-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    if (!authService.isDemo() && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'contacts'), {
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email,
          phone: newContact.phone,
          jobTitle: newContact.jobTitle,
          accountId: newContact.accountId,
          createdAt: newContact.createdAt
        });
        newContact.id = docRef.id;
        return newContact;
      } catch (e) {
        console.error("Firestore write error, using localStorage fallback", e);
      }
    }

    const contacts = getLocal<Contact>('wf_crm_contacts', SEED_CONTACTS);
    contacts.push(newContact);
    setLocal('wf_crm_contacts', contacts);
    return newContact;
  },

  async updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>): Promise<void> {
    if (!authService.isDemo() && firestore) {
      try {
        const docRef = doc(firestore, 'contacts', id);
        await updateDoc(docRef, updates);
        return;
      } catch (e) {
        console.error("Firestore update error, using localStorage fallback", e);
      }
    }

    const contacts = getLocal<Contact>('wf_crm_contacts', SEED_CONTACTS);
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      setLocal('wf_crm_contacts', contacts);
    }
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (!authService.isDemo() && firestore) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'projects'));
        const projects: Project[] = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        return projects;
      } catch (e) {
        console.error("Firestore read error, using localStorage fallback", e);
      }
    }
    return getLocal<Project>('wf_crm_projects', SEED_PROJECTS);
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: 'proj-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    if (!authService.isDemo() && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'projects'), {
          name: newProject.name,
          owner: newProject.owner,
          status: newProject.status,
          accountId: newProject.accountId,
          contactId: newProject.contactId,
          startDate: newProject.startDate,
          targetDate: newProject.targetDate,
          percentageComplete: newProject.percentageComplete,
          summary: newProject.summary,
          createdAt: newProject.createdAt
        });
        newProject.id = docRef.id;
        return newProject;
      } catch (e) {
        console.error("Firestore write error, using localStorage fallback", e);
      }
    }

    const projects = getLocal<Project>('wf_crm_projects', SEED_PROJECTS);
    projects.push(newProject);
    setLocal('wf_crm_projects', projects);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    if (!authService.isDemo() && firestore) {
      try {
        const docRef = doc(firestore, 'projects', id);
        await updateDoc(docRef, updates);
        return;
      } catch (e) {
        console.error("Firestore update error, using localStorage fallback", e);
      }
    }

    const projects = getLocal<Project>('wf_crm_projects', SEED_PROJECTS);
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      setLocal('wf_crm_projects', projects);
    }
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    if (!authService.isDemo() && firestore) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'assets'));
        const assets: Asset[] = [];
        querySnapshot.forEach((doc) => {
          assets.push({ id: doc.id, ...doc.data() } as Asset);
        });
        return assets;
      } catch (e) {
        console.error("Firestore read error, using localStorage fallback", e);
      }
    }
    return getLocal<Asset>('wf_crm_assets', SEED_ASSETS);
  },

  async addAsset(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
    const newAsset: Asset = {
      ...asset,
      id: 'ast-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    if (!authService.isDemo() && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'assets'), {
          name: newAsset.name,
          serviceProvider: newAsset.serviceProvider,
          details: newAsset.details,
          accountId: newAsset.accountId,
          status: newAsset.status,
          notes: newAsset.notes,
          createdAt: newAsset.createdAt
        });
        newAsset.id = docRef.id;
        return newAsset;
      } catch (e) {
        console.error("Firestore write error, using localStorage fallback", e);
      }
    }

    const assets = getLocal<Asset>('wf_crm_assets', SEED_ASSETS);
    assets.push(newAsset);
    setLocal('wf_crm_assets', assets);
    return newAsset;
  },

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>): Promise<void> {
    if (!authService.isDemo() && firestore) {
      try {
        const docRef = doc(firestore, 'assets', id);
        await updateDoc(docRef, updates);
        return;
      } catch (e) {
        console.error("Firestore update error, using localStorage fallback", e);
      }
    }

    const assets = getLocal<Asset>('wf_crm_assets', SEED_ASSETS);
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      assets[index] = { ...assets[index], ...updates };
      setLocal('wf_crm_assets', assets);
    }
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    if (!authService.isDemo() && firestore) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'vendors'));
        const vendors: Vendor[] = [];
        querySnapshot.forEach((doc) => {
          vendors.push({ id: doc.id, ...doc.data() } as Vendor);
        });
        return vendors;
      } catch (e) {
        console.error("Firestore read error, using localStorage fallback", e);
      }
    }
    return getLocal<Vendor>('wf_crm_vendors', SEED_VENDORS);
  },

  async addVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: 'ven-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    if (!authService.isDemo() && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'vendors'), {
          name: newVendor.name,
          category: newVendor.category,
          website: newVendor.website,
          supportEmail: newVendor.supportEmail,
          supportPhone: newVendor.supportPhone,
          notes: newVendor.notes,
          createdAt: newVendor.createdAt
        });
        newVendor.id = docRef.id;
        return newVendor;
      } catch (e) {
        console.error("Firestore write error, using localStorage fallback", e);
      }
    }

    const vendors = getLocal<Vendor>('wf_crm_vendors', SEED_VENDORS);
    vendors.push(newVendor);
    setLocal('wf_crm_vendors', vendors);
    return newVendor;
  },

  async updateVendor(id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Promise<void> {
    if (!authService.isDemo() && firestore) {
      try {
        const docRef = doc(firestore, 'vendors', id);
        await updateDoc(docRef, updates);
        return;
      } catch (e) {
        console.error("Firestore update error, using localStorage fallback", e);
      }
    }

    const vendors = getLocal<Vendor>('wf_crm_vendors', SEED_VENDORS);
    const index = vendors.findIndex(v => v.id === id);
    if (index !== -1) {
      vendors[index] = { ...vendors[index], ...updates };
      setLocal('wf_crm_vendors', vendors);
    }
  }
};
