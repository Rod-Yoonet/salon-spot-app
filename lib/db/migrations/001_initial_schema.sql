-- PostgreSQL Migration Script for Salon Spot App
-- This script creates the initial database schema for Vercel Postgres

-- Core User/Auth (Synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  imageUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Training Module
CREATE TABLE IF NOT EXISTS training_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  estimatedHours INTEGER,
  requiredForRole BOOLEAN,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Training Resources
CREATE TABLE IF NOT EXISTS training_resources (
  id TEXT PRIMARY KEY,
  moduleId TEXT,
  title TEXT,
  type TEXT,
  url TEXT,
  createdAt TIMESTAMP,
  FOREIGN KEY(moduleId) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Training Progress
CREATE TABLE IF NOT EXISTS training_progress (
  id TEXT PRIMARY KEY,
  vaId TEXT,
  moduleId TEXT,
  status TEXT,
  completionDate TIMESTAMP,
  score INTEGER,
  notes TEXT,
  lastAccessedAt TIMESTAMP,
  certificateValidUntil TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY(moduleId) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Supplier Contacts
CREATE TABLE IF NOT EXISTS supplier_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contactName TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  categories TEXT,
  stage TEXT,
  margin DECIMAL(10, 2),
  minimumOrder INTEGER,
  paymentTerms TEXT,
  leadSource TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastContactDate TIMESTAMP,
  nextFollowUpDate TIMESTAMP,
  notes TEXT,
  updatedAt TIMESTAMP
);

-- Outreach Log
CREATE TABLE IF NOT EXISTS outreach_log (
  id TEXT PRIMARY KEY,
  supplierId TEXT,
  type TEXT,
  subject TEXT,
  notes TEXT,
  contactDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(supplierId) REFERENCES supplier_contacts(id) ON DELETE CASCADE
);

-- FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  category TEXT,
  tags TEXT,
  createdBy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approvedBy TEXT,
  approvedAt TIMESTAMP,
  status TEXT,
  viewCount INTEGER DEFAULT 0,
  submissionCount INTEGER DEFAULT 0,
  relatedFaqIds TEXT,
  lastUpdatedAt TIMESTAMP,
  updateReason TEXT
);

-- FAQ Submissions
CREATE TABLE IF NOT EXISTS faq_submissions (
  id TEXT PRIMARY KEY,
  faqItemId TEXT,
  questionText TEXT NOT NULL,
  source TEXT,
  sourceDetails TEXT,
  askedBy TEXT,
  askedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(faqItemId) REFERENCES faq_items(id) ON DELETE SET NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT,
  status TEXT,
  dueDate DATE,
  createdBy TEXT,
  assignedTo TEXT,
  linkedModule TEXT,
  linkedItemId TEXT,
  linkedItemName TEXT,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  notes TEXT,
  FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- Sales Targets
CREATE TABLE IF NOT EXISTS sales_targets (
  id TEXT PRIMARY KEY,
  period TEXT,
  periodStart DATE,
  periodEnd DATE,
  targetRevenue DECIMAL(12, 2),
  targetByCategory TEXT,
  createdAt TIMESTAMP,
  notes TEXT
);

-- Sales Metrics
CREATE TABLE IF NOT EXISTS sales_metrics (
  id TEXT PRIMARY KEY,
  date DATE,
  actualRevenue DECIMAL(12, 2),
  revenueByCategory TEXT,
  newCustomers INTEGER,
  repeatCustomers INTEGER,
  averageOrderValue DECIMAL(10, 2),
  conversionRate DECIMAL(5, 2),
  trafficSessions INTEGER,
  source TEXT,
  recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Tasks
CREATE TABLE IF NOT EXISTS seo_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  assignedTo TEXT,
  status TEXT,
  dueDate DATE,
  completedAt TIMESTAMP,
  evidence TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Keyword Targets
CREATE TABLE IF NOT EXISTS keyword_targets (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  category TEXT,
  searchVolume INTEGER,
  difficulty TEXT,
  targetPage TEXT,
  currentRank INTEGER,
  targetRank INTEGER,
  lastChecked TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- SEO Metrics
CREATE TABLE IF NOT EXISTS seo_metrics (
  id TEXT PRIMARY KEY,
  date DATE,
  organicTraffic INTEGER,
  topKeywords TEXT,
  technicalScore INTEGER,
  performanceScore INTEGER,
  recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Campaigns
CREATE TABLE IF NOT EXISTS social_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platforms TEXT,
  startDate DATE,
  endDate DATE,
  goal TEXT,
  targetAudience TEXT,
  contentTheme TEXT,
  postingSchedule TEXT,
  budget DECIMAL(10, 2),
  status TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);

-- Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  campaignId TEXT,
  platform TEXT,
  scheduledDate TIMESTAMP,
  content TEXT,
  imageUrls TEXT,
  hashtags TEXT,
  caption TEXT,
  status TEXT,
  publishedAt TIMESTAMP,
  metrics TEXT,
  metricsCollectedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(campaignId) REFERENCES social_campaigns(id) ON DELETE CASCADE
);

-- Social Metrics
CREATE TABLE IF NOT EXISTS social_metrics (
  id TEXT PRIMARY KEY,
  platform TEXT,
  date DATE,
  followers INTEGER,
  engagement INTEGER,
  reach INTEGER,
  impressions INTEGER,
  topPost TEXT,
  recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  businessType TEXT,
  location TEXT,
  estimatedAnnualBudget DECIMAL(12, 2),
  source TEXT,
  firstContactDate TIMESTAMP,
  lastContactDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  notes TEXT,
  preferredContact TEXT
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT,
  expectedValue DECIMAL(12, 2),
  probability INTEGER,
  estimatedCloseDate DATE,
  closedDate DATE,
  outcome TEXT,
  lossReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Opportunity Activity
CREATE TABLE IF NOT EXISTS opportunity_activity (
  id TEXT PRIMARY KEY,
  opportunityId TEXT,
  type TEXT,
  summary TEXT,
  notes TEXT,
  date TIMESTAMP,
  nextActionDate DATE,
  nextActionType TEXT,
  createdBy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  opportunityId TEXT,
  amount DECIMAL(12, 2),
  margin DECIMAL(5, 2),
  date DATE,
  paymentMethod TEXT,
  items TEXT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY(opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_progress_vaId ON training_progress(vaId);
CREATE INDEX IF NOT EXISTS idx_training_progress_moduleId ON training_progress(moduleId);
CREATE INDEX IF NOT EXISTS idx_outreach_log_supplierId ON outreach_log(supplierId);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_stage ON supplier_contacts(stage);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_customerId ON opportunities(customerId);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunity_activity_opportunityId ON opportunity_activity(opportunityId);
CREATE INDEX IF NOT EXISTS idx_transactions_customerId ON transactions(customerId);
CREATE INDEX IF NOT EXISTS idx_social_posts_campaignId ON social_posts(campaignId);
CREATE INDEX IF NOT EXISTS idx_faq_items_status ON faq_items(status);
CREATE INDEX IF NOT EXISTS idx_faq_submissions_faqItemId ON faq_submissions(faqItemId);
CREATE INDEX IF NOT EXISTS idx_faq_submissions_source ON faq_submissions(source);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
CREATE INDEX IF NOT EXISTS idx_tasks_linkedModule ON tasks(linkedModule);
CREATE INDEX IF NOT EXISTS idx_seo_tasks_status ON seo_tasks(status);
