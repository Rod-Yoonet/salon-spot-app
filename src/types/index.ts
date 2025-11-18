// User types
export type UserRole = 'admin' | 'va' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Training types
export type TrainingCategory = 'shopify' | 'apps' | 'customer-service' | 'product-knowledge' | 'brand-guidelines' | 'compliance';
export type TrainingStatus = 'not-started' | 'in-progress' | 'completed';
export type ResourceType = 'pdf' | 'video' | 'link' | 'file';

export interface TrainingModule {
  id: string;
  name: string;
  category: TrainingCategory;
  description: string;
  estimatedHours: number;
  requiredForRole: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TrainingResource {
  id: string;
  moduleId: string;
  title: string;
  type: ResourceType;
  url: string;
  createdAt: string;
}

export interface TrainingProgress {
  id: string;
  vaId: string;
  moduleId: string;
  status: TrainingStatus;
  completionDate?: string;
  score?: number;
  notes?: string;
  lastAccessedAt?: string;
  certificateValidUntil?: string;
  updatedAt?: string;
}

// Supplier types
export type SupplierCategory = 'furniture' | 'beauty-supplies' | 'laser-machines' | 'wellness' | 'other';
export type SupplierStatus = 'prospect' | 'contacted' | 'proposal-sent' | 'negotiating' | 'active' | 'inactive' | 'rejected';
export type OutreachType = 'email' | 'phone' | 'message' | 'in-person';
export type OutreachOutcome = 'interested' | 'not-interested' | 'call-scheduled' | 'awaiting-response';

export interface SupplierContact {
  id: string;
  name: string;
  category: SupplierCategory;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  status: SupplierStatus;
  margin?: number;
  minimumOrder?: number;
  paymentTerms?: string;
  leadSource?: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  updatedAt?: string;
}

export interface OutreachLog {
  id: string;
  supplierId: string;
  type: OutreachType;
  summary: string;
  response?: string;
  date: string;
  outcome: OutreachOutcome;
  createdAt: string;
}

// FAQ types
export type FAQCategory = 'customer-questions' | 'product-issues' | 'process' | 'technical' | 'marketing';
export type FAQStatus = 'draft' | 'pending-review' | 'published' | 'archived';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  tags: string[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: FAQStatus;
  viewCount: number;
  relatedFaqIds: string[];
  lastUpdatedAt?: string;
  updateReason?: string;
}

// Sales types
export type SalesPeriod = 'month' | 'quarter' | 'year';

export interface SalesTarget {
  id: string;
  period: SalesPeriod;
  periodStart: string;
  periodEnd: string;
  targetRevenue: number;
  targetByCategory: {
    furniture: number;
    'beauty-supplies': number;
    'laser-machines': number;
  };
  createdAt: string;
  notes?: string;
}

export interface SalesMetric {
  id: string;
  date: string;
  actualRevenue: number;
  revenueByCategory: {
    furniture: number;
    'beauty-supplies': number;
    'laser-machines': number;
  };
  newCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  trafficSessions: number;
  source: 'shopify-api' | 'manual-entry';
  recordedAt: string;
}

// SEO types
export type SEOCategory = 'keyword-research' | 'content-creation' | 'on-page' | 'technical' | 'link-building' | 'audit';
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';
export type Difficulty = 'low' | 'medium' | 'high';

export interface SEOTask {
  id: string;
  title: string;
  description: string;
  category: SEOCategory;
  priority: Priority;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  evidence?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KeywordTarget {
  id: string;
  keyword: string;
  category: string;
  searchVolume: number;
  difficulty: Difficulty;
  targetPage: string;
  currentRank?: number;
  targetRank: number;
  lastChecked?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SEOMetric {
  id: string;
  date: string;
  organicTraffic: number;
  topKeywords: Array<{
    keyword: string;
    rank: number;
    clicks: number;
    impressions: number;
  }>;
  technicalScore: number;
  performanceScore: number;
  recordedAt: string;
}

// Social Media types
export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export type CampaignStatus = 'planning' | 'active' | 'completed' | 'paused';
export type PostStatus = 'draft' | 'scheduled' | 'published';

export interface SocialCampaign {
  id: string;
  name: string;
  platforms: SocialPlatform[];
  startDate: string;
  endDate: string;
  goal: string;
  targetAudience: string;
  contentTheme: string;
  postingSchedule: {
    day: string;
    time: string;
  }[];
  budget?: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialPost {
  id: string;
  campaignId: string;
  platform: SocialPlatform;
  scheduledDate: string;
  content: string;
  imageUrls: string[];
  hashtags: string[];
  caption: string;
  status: PostStatus;
  publishedAt?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  metricsCollectedAt?: string;
  createdAt: string;
}

export interface SocialMetric {
  id: string;
  platform: SocialPlatform;
  date: string;
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  topPost?: string;
  recordedAt: string;
}

// Customer types
export type CustomerSource = 'organic' | 'ads' | 'referral' | 'social' | 'outreach';
export type OpportunityStage = 'lead' | 'interested' | 'quote-sent' | 'negotiating' | 'won' | 'lost';
export type ActivityType = 'email-sent' | 'call' | 'quote-sent' | 'proposal' | 'demo' | 'message' | 'note';
export type PreferredContact = 'email' | 'phone' | 'sms';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  website?: string;
  businessType?: string;
  location?: string;
  estimatedAnnualBudget?: number;
  source: CustomerSource;
  firstContactDate: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  preferredContact?: PreferredContact;
}

export interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  stage: OpportunityStage;
  expectedValue: number;
  probability: number;
  estimatedCloseDate: string;
  closedDate?: string;
  outcome?: 'won' | 'lost' | 'stalled';
  lossReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: ActivityType;
  summary: string;
  notes?: string;
  date: string;
  nextActionDate?: string;
  nextActionType?: string;
  createdBy: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  opportunityId?: string;
  amount: number;
  margin: number;
  date: string;
  paymentMethod: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    margin: number;
  }>;
  notes?: string;
  createdAt: string;
}
