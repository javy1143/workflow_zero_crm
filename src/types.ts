export interface Account {
  id: string;
  name: string;
  status: 'Active' | 'Lead' | 'Inactive';
  industry: string;
  website: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  accountId: string; // Linked account ID
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  accountId: string; // Linked account ID
  contactId: string; // Linked primary contact ID
  startDate: string;
  targetDate: string;
  percentageComplete: number; // 0 - 100
  summary: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  serviceProvider: 'Make' | 'Google' | 'OpenAI' | 'AWS' | 'Other';
  details: string; // Integration configurations/credentials
  accountId: string; // Linked account ID
  status: 'Active' | 'Deprecated' | 'Testing';
  notes: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  notes: string;
  createdAt: string;
}
