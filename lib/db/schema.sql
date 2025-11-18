-- Core User/Auth (Synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  name TEXT,
  email TEXT UNIQUE,
  role TEXT, -- admin, team
  imageUrl TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);

-- Training Module
CREATE TABLE IF NOT EXISTS training_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  estimatedHours INTEGER,
  requiredForRole BOOLEAN,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);

-- Training Resources (many-to-many or embedded)
CREATE TABLE IF NOT EXISTS training_resources (
  id TEXT PRIMARY KEY,
  moduleId TEXT,
  title TEXT,
  type TEXT, -- pdf, video, link, file
  url TEXT,
  createdAt DATETIME,
  FOREIGN KEY(moduleId) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- Training Progress
CREATE TABLE IF NOT EXISTS training_progress (
  id TEXT PRIMARY KEY,
  vaId TEXT,
  moduleId TEXT,
  status TEXT, -- not-started, in-progress, completed
  completionDate DATETIME,
  score INTEGER,
  notes TEXT,
  lastAccessedAt DATETIME,
  certificateValidUntil DATETIME,
  updatedAt DATETIME,
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
  categories TEXT, -- JSON array of categories
  stage TEXT, -- discovered, approved, contacted, proceeded, lost
  margin REAL,
  minimumOrder INTEGER,
  paymentTerms TEXT,
  leadSource TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastContactDate DATETIME,
  nextFollowUpDate DATETIME,
  notes TEXT,
  updatedAt DATETIME
);

-- Outreach Log
CREATE TABLE IF NOT EXISTS outreach_log (
  id TEXT PRIMARY KEY,
  supplierId TEXT,
  type TEXT, -- email, phone, meeting, zoom
  subject TEXT,
  notes TEXT,
  contactDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(supplierId) REFERENCES supplier_contacts(id) ON DELETE CASCADE
);

-- FAQ Items (Master approved answers)
CREATE TABLE IF NOT EXISTS faq_items (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  category TEXT,
  tags TEXT, -- JSON array
  createdBy TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  approvedBy TEXT,
  approvedAt DATETIME,
  status TEXT, -- draft, pending-review, published, archived
  viewCount INTEGER DEFAULT 0,
  submissionCount INTEGER DEFAULT 0,
  relatedFaqIds TEXT, -- JSON array
  lastUpdatedAt DATETIME,
  updateReason TEXT
);

-- FAQ Submissions (Individual question instances)
CREATE TABLE IF NOT EXISTS faq_submissions (
  id TEXT PRIMARY KEY,
  faqItemId TEXT,
  questionText TEXT NOT NULL,
  source TEXT, -- email, social-media, live-chat, phone, in-person
  sourceDetails TEXT, -- Additional details about the source
  askedBy TEXT, -- Customer name or identifier
  askedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(faqItemId) REFERENCES faq_items(id) ON DELETE SET NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT, -- low, medium, high, urgent
  status TEXT, -- pending, in-progress, completed
  dueDate DATE,
  createdBy TEXT, -- User who created the task
  assignedTo TEXT, -- User assigned to the task
  linkedModule TEXT, -- customer, opportunity, faq, supplier, training
  linkedItemId TEXT,
  linkedItemName TEXT, -- Denormalized for quick display
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME,
  notes TEXT,
  FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- Sales Targets
CREATE TABLE IF NOT EXISTS sales_targets (
  id TEXT PRIMARY KEY,
  period TEXT, -- month, quarter, year
  periodStart DATE,
  periodEnd DATE,
  targetRevenue REAL,
  targetByCategory TEXT, -- JSON object
  createdAt DATETIME,
  notes TEXT
);

-- Sales Metrics
CREATE TABLE IF NOT EXISTS sales_metrics (
  id TEXT PRIMARY KEY,
  date DATE,
  actualRevenue REAL,
  revenueByCategory TEXT, -- JSON object
  newCustomers INTEGER,
  repeatCustomers INTEGER,
  averageOrderValue REAL,
  conversionRate REAL,
  trafficSessions INTEGER,
  source TEXT, -- shopify-api, manual-entry
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SEO Tasks
CREATE TABLE IF NOT EXISTS seo_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT, -- high, medium, low
  assignedTo TEXT,
  status TEXT,
  dueDate DATE,
  completedAt DATETIME,
  evidence TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
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
  lastChecked DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);

-- SEO Metrics
CREATE TABLE IF NOT EXISTS seo_metrics (
  id TEXT PRIMARY KEY,
  date DATE,
  organicTraffic INTEGER,
  topKeywords TEXT, -- JSON array
  technicalScore INTEGER,
  performanceScore INTEGER,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social Campaigns
CREATE TABLE IF NOT EXISTS social_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platforms TEXT, -- JSON array
  startDate DATE,
  endDate DATE,
  goal TEXT,
  targetAudience TEXT,
  contentTheme TEXT,
  postingSchedule TEXT, -- JSON
  budget REAL,
  status TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);

-- Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  campaignId TEXT,
  platform TEXT,
  scheduledDate DATETIME,
  content TEXT,
  imageUrls TEXT, -- JSON array
  hashtags TEXT, -- JSON array
  caption TEXT,
  status TEXT,
  publishedAt DATETIME,
  metrics TEXT, -- JSON object
  metricsCollectedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
  estimatedAnnualBudget REAL,
  source TEXT,
  firstContactDate DATETIME,
  lastContactDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME,
  notes TEXT,
  preferredContact TEXT
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT, -- lead, interested, quote-sent, negotiating, won, lost
  expectedValue REAL,
  probability INTEGER,
  estimatedCloseDate DATE,
  closedDate DATE,
  outcome TEXT,
  lossReason TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME,
  FOREIGN KEY(customerId) REFERENCES customers(id) ON DELETE CASCADE
);

-- Opportunity Activity
CREATE TABLE IF NOT EXISTS opportunity_activity (
  id TEXT PRIMARY KEY,
  opportunityId TEXT,
  type TEXT, -- email-sent, call, quote-sent, proposal, demo, message, note
  summary TEXT,
  notes TEXT,
  date DATETIME,
  nextActionDate DATE,
  nextActionType TEXT,
  createdBy TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  opportunityId TEXT,
  amount REAL,
  margin REAL,
  date DATE,
  paymentMethod TEXT,
  items TEXT, -- JSON array
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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
