export type AccountStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Discovery Scheduled'
  | 'Proposal Sent'
  | 'Contract Sent'
  | 'Active Client'
  | 'Paused'
  | 'Past Client'
  | 'Lost'
  | 'Active'
  | 'Lead'
  | 'Inactive';

export type HealthStatus = 'Green' | 'Yellow' | 'Red';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Account {
  id: string;
  accountNumber?: string;
  name: string;
  status: AccountStatus;
  health?: HealthStatus;
  serviceType?: string;
  primaryContactId?: string;
  billingContactId?: string;
  technicalContactId?: string;
  monthlyFee?: number;
  nextAction?: string;
  industry: string;
  companySize?: string;
  numberOfLocations?: string;
  website: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  timeZone?: string;
  businessHours?: string;
  leadSource?: string;
  dateAdded?: string;
  firstContactDate?: string;
  salesStage?: string;
  lastContactedDate?: string;
  nextFollowUpDate?: string;
  serviceInterestedIn?: string;
  estimatedSetupFee?: number;
  estimatedMonthlyFee?: number;
  finalSetupFee?: number;
  finalMonthlyFee?: number;
  proposalStatus?: string;
  proposalSentDate?: string;
  contractStatus?: string;
  contractSignedDate?: string;
  clientStartDate?: string;
  renewalDate?: string;
  lostReason?: string;
  lostNotes?: string;
  businessDescription?: string;
  currentTools?: string;
  currentCrm?: string;
  currentEmailSystem?: string;
  currentWebsitePlatform?: string;
  currentFormTool?: string;
  painPoints?: string;
  manualProcesses?: string;
  automationMaturity?: string;
  businessGoals?: string;
  internalNotes?: string;
  supportExpectations?: string;
  preferredCommunication?: string;
  reportingFrequency?: string;
  createdAt: string;
  documents?: {
    id: string;
    name: string;
    size: string;
    uploadedAt: string;
  }[];
}

export interface Contact {
  id: string;
  contactNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  jobTitle: string;
  department?: string;
  accountId: string;
  contactRole?: string;
  influenceLevel?: 'High' | 'Medium' | 'Low';
  relationshipType?: 'Champion' | 'Neutral' | 'Blocker';
  preferredContactMethod?: string;
  bestTimeToReach?: string;
  lastContactedDate?: string;
  notes?: string;
  createdAt: string;
}

export type ProjectStatus =
  | 'New Request'
  | 'Discovery'
  | 'Scope Approved'
  | 'Build In Progress'
  | 'Waiting on Client'
  | 'Internal Testing'
  | 'Client Testing'
  | 'Revisions'
  | 'Launched'
  | 'Completed'
  | 'Paused'
  | 'Cancelled'
  | 'Planning'
  | 'In Progress'
  | 'On Hold';

export interface Project {
  id: string;
  projectNumber?: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  priority?: Priority;
  projectType?: string;
  accountId: string;
  contactId: string;
  startDate: string;
  targetDate: string;
  actualLaunchDate?: string;
  percentageComplete: number;
  summary: string;
  problemStatement?: string;
  scope?: string;
  requirements?: string;
  toolsInvolved?: string;
  clientResponsibilities?: string;
  internalResponsibilities?: string;
  testingStatus?: 'Not Started' | 'In Progress' | 'Passed' | 'Failed';
  launchChecklistStatus?: 'Not Started' | 'In Progress' | 'Complete';
  notes?: string;
  createdAt: string;
}

export interface Automation {
  id: string;
  automationNumber?: string;
  accountId: string;
  projectId?: string;
  name: string;
  status: 'Draft' | 'Testing' | 'Active' | 'Error' | 'Paused' | 'Retired';
  platform: string;
  workflowUrl?: string;
  description?: string;
  businessProcess?: string;
  processOwner?: string;
  criticality: 'Low' | 'Medium' | 'High' | 'Business Critical';
  triggerSystem?: string;
  triggerEvent?: string;
  actionSystems?: string;
  connectedApps?: string;
  apiDependencies?: string;
  dataProcessed?: string;
  aiModelUsed?: string;
  promptLocation?: string;
  errorHandlingMethod?: string;
  notificationRecipients?: string;
  logsLocation?: string;
  backupManualProcess?: string;
  lastSuccessfulRun?: string;
  lastFailedRun?: string;
  failuresThisMonth?: number;
  estimatedHoursSavedPerMonth?: number;
  monthlyUsageCost?: number;
  lastReviewedDate?: string;
  nextReviewDate?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetNumber?: string;
  name: string;
  serviceProvider: string;
  vendorPlatform?: string;
  assetType?: string;
  details: string;
  url?: string;
  loginUsername?: string;
  passwordManagerReference?: string;
  mfaEnabled?: 'Yes' | 'No';
  mfaMethod?: string;
  accountOwner?: string;
  accessLevel?: string;
  whoHasAccess?: string;
  accountId: string;
  projectId?: string;
  automationId?: string;
  status: 'Active' | 'Inactive' | 'Needs Review' | 'Broken' | 'Pending Access' | 'Retired' | 'Deprecated' | 'Testing';
  lastReviewedDate?: string;
  notes: string;
  createdAt: string;
}

export interface Task {
  id: string;
  taskNumber?: string;
  accountId: string;
  contactId?: string;
  projectId?: string;
  automationId?: string;
  supportTicketId?: string;
  name: string;
  taskType: string;
  assignedTo: string;
  dueDate: string;
  priority: Priority;
  status: 'Not Started' | 'In Progress' | 'Waiting on Client' | 'Completed';
  notes?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  accountId: string;
  automationId?: string;
  projectId?: string;
  requestedByContactId?: string;
  issueTitle: string;
  issueType: string;
  priority: Priority;
  status: 'New' | 'In Progress' | 'Waiting on Client' | 'Resolved' | 'Closed';
  description?: string;
  dateOpened: string;
  dateResolved?: string;
  rootCause?: string;
  resolutionNotes?: string;
  clientNotified?: 'Yes' | 'No';
  internalNotes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reportNumber?: string;
  accountId: string;
  projectId?: string;
  automationId?: string;
  reportType: string;
  reportingPeriod: string;
  status: 'Draft' | 'Ready' | 'Sent' | 'Reviewed' | 'Follow-Up Needed';
  createdDate: string;
  sentDate?: string;
  sentTo?: string;
  reportLink?: string;
  successfulRuns?: number;
  failedRuns?: number;
  errorRate?: string;
  hoursSaved?: number;
  estimatedCostSavings?: number;
  issuesResolved?: string;
  improvementsMade?: string;
  recommendations?: string;
  clientActionItems?: string;
  nextSteps?: string;
  createdAt: string;
}

export interface BillingContract {
  id: string;
  billingNumber?: string;
  accountId: string;
  servicePackage: string;
  setupFee?: number;
  monthlyRecurringFee?: number;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  paymentMethod?: string;
  paymentStatus: 'Current' | 'Due Soon' | 'Past Due' | 'Cancelled' | 'Trial';
  lastInvoiceDate?: string;
  nextInvoiceDate?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  renewalDate?: string;
  cancellationTerms?: string;
  includedSupportHours?: number;
  extraHourlyRate?: number;
  extraChargesThisMonth?: number;
  contractStatus: 'Draft' | 'Sent' | 'Signed' | 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled';
  proposalLink?: string;
  contractLink?: string;
  scopeSummary?: string;
  billingNotes?: string;
  createdAt: string;
}

export interface AdminSettings {
  id: string;
  companyName: string;
  businessEmail: string;
  timezone: string;
  defaultAccountOwner?: string;
  reportFrequencyDefault?: string;
  taskReminderTiming?: string;
  renewalReminderWindow?: string;
  failedAutomationAlertRule?: string;
  clientFacingVisibilityDefault?: string;
  exportPermission?: string;
  auditLogEnabled?: 'Yes' | 'No';
  mfaRequired?: 'Yes' | 'No';
  sessionTimeout?: string;
  brandNotes?: string;
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

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'text';
  direction: 'inbound' | 'outbound';
  accountId: string;
  contactId?: string;
  timestamp: string;
  subject: string;
  content: string;
  creatorName: string;
  metadata?: {
    duration?: number;
    emailAddress?: string;
    phoneNumber?: string;
  };
}
