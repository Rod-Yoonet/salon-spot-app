import db, { generateId, formatDateForDb, stringifyJsonField } from './index';

export function seedDatabase() {
  console.log('Starting database seeding...');

  // Create admin user (Dominique)
  const adminId = generateId();
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'Dominique Alexa Carter', 'dominique@thesalonspot.com', 'admin', formatDateForDb(new Date()));

  // Create VA user
  const vaId = generateId();
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(vaId, 'VA User', 'va@thesalonspot.com', 'va', formatDateForDb(new Date()));

  console.log('Users created');

  // Create training modules
  const modules = [
    {
      name: 'Shopify Platform Basics',
      category: 'shopify',
      description: 'Learn the fundamentals of managing The Salon Spot Shopify store',
      estimatedHours: 8,
      required: true
    },
    {
      name: 'Customer Service Excellence',
      category: 'customer-service',
      description: 'Master customer communication and support best practices',
      estimatedHours: 6,
      required: true
    },
    {
      name: 'Product Knowledge - Furniture',
      category: 'product-knowledge',
      description: 'Deep dive into furniture product line, suppliers, and specifications',
      estimatedHours: 10,
      required: true
    },
    {
      name: 'Product Knowledge - Beauty Supplies',
      category: 'product-knowledge',
      description: 'Comprehensive guide to beauty supplies and skincare products',
      estimatedHours: 8,
      required: true
    },
    {
      name: 'Brand Guidelines & Voice',
      category: 'brand-guidelines',
      description: 'Understanding The Salon Spot brand identity and communication style',
      estimatedHours: 4,
      required: true
    },
    {
      name: 'Gmail & Google Workspace',
      category: 'apps',
      description: 'Email management, calendar, and workspace tools',
      estimatedHours: 3,
      required: false
    }
  ];

  const moduleIds: string[] = [];
  modules.forEach(module => {
    const id = generateId();
    moduleIds.push(id);
    db.prepare(`
      INSERT INTO training_modules (id, name, category, description, estimatedHours, requiredForRole, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      module.name,
      module.category,
      module.description,
      module.estimatedHours,
      module.required ? 1 : 0,
      formatDateForDb(new Date())
    );

    // Create training progress for VA
    db.prepare(`
      INSERT INTO training_progress (id, vaId, moduleId, status, lastAccessedAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      vaId,
      id,
      'not-started',
      formatDateForDb(new Date()),
      formatDateForDb(new Date())
    );
  });

  console.log('Training modules created');

  // Create sample customers
  const customers = [
    {
      name: 'Beauty Haven Spa',
      email: 'contact@beautyhaven.com',
      phone: '+61 2 9876 5432',
      company: 'Beauty Haven',
      businessType: 'Spa & Wellness',
      location: 'Sydney, NSW',
      source: 'ads',
      estimatedBudget: 50000
    },
    {
      name: 'Luxury Furniture Co',
      email: 'orders@luxuryfurniture.com.au',
      phone: '+61 3 8765 4321',
      company: 'Luxury Furniture Co',
      businessType: 'Retail',
      location: 'Melbourne, VIC',
      source: 'organic',
      estimatedBudget: 120000
    },
    {
      name: 'Wellness Clinic Brisbane',
      email: 'admin@wellnessclinic.com.au',
      company: 'Wellness Clinic',
      businessType: 'Medical',
      location: 'Brisbane, QLD',
      source: 'referral',
      estimatedBudget: 80000
    }
  ];

  const customerIds: string[] = [];
  customers.forEach(customer => {
    const id = generateId();
    customerIds.push(id);
    db.prepare(`
      INSERT INTO customers (id, name, email, phone, company, businessType, location, source, estimatedAnnualBudget, firstContactDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      customer.name,
      customer.email,
      customer.phone || null,
      customer.company,
      customer.businessType,
      customer.location,
      customer.source,
      customer.estimatedBudget,
      formatDateForDb(new Date()),
      formatDateForDb(new Date())
    );
  });

  console.log('Customers created');

  // Create sample opportunities
  const opportunities = [
    {
      customerId: customerIds[0],
      title: 'Laser Machine Purchase',
      description: 'Interested in professional laser hair removal equipment',
      stage: 'quote-sent',
      expectedValue: 28000,
      probability: 70
    },
    {
      customerId: customerIds[1],
      title: 'Office Furniture Order',
      description: 'Bulk order for new office space',
      stage: 'negotiating',
      expectedValue: 45000,
      probability: 85
    },
    {
      customerId: customerIds[2],
      title: 'Beauty Supplies Package',
      description: 'Monthly subscription for beauty products',
      stage: 'interested',
      expectedValue: 12000,
      probability: 50
    }
  ];

  opportunities.forEach(opp => {
    const id = generateId();
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + 14);

    db.prepare(`
      INSERT INTO opportunities (id, customerId, title, description, stage, expectedValue, probability, estimatedCloseDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      opp.customerId,
      opp.title,
      opp.description,
      opp.stage,
      opp.expectedValue,
      opp.probability,
      formatDateForDb(closeDate),
      formatDateForDb(new Date())
    );
  });

  console.log('Opportunities created');

  // Create sample supplier contacts
  const suppliers = [
    {
      name: 'Premium Beauty Supplies Ltd',
      category: 'beauty-supplies',
      email: 'sales@premiumbeauty.com',
      status: 'active',
      margin: 35,
      minimumOrder: 500
    },
    {
      name: 'Laser Tech Solutions',
      category: 'laser-machines',
      email: 'contact@lasertech.com.au',
      status: 'negotiating',
      margin: 28,
      minimumOrder: 1000
    },
    {
      name: 'Modern Furniture Wholesale',
      category: 'furniture',
      email: 'wholesale@modernfurniture.com',
      status: 'contacted',
      margin: 30,
      minimumOrder: 2000
    }
  ];

  suppliers.forEach(supplier => {
    const id = generateId();
    db.prepare(`
      INSERT INTO supplier_contacts (id, name, category, contactEmail, status, margin, minimumOrder, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      supplier.name,
      supplier.category,
      supplier.email,
      supplier.status,
      supplier.margin,
      supplier.minimumOrder,
      formatDateForDb(new Date())
    );
  });

  console.log('Supplier contacts created');

  // Create sample FAQs
  const faqs = [
    {
      question: 'What is the warranty on laser hair removal machines?',
      answer: 'All our professional laser machines come with a 2-year manufacturer warranty covering parts and labor. Extended warranty options are available.',
      category: 'customer-questions',
      tags: ['warranty', 'laser-machines', 'product-info'],
      status: 'published'
    },
    {
      question: 'Do you offer bulk discounts on beauty supplies?',
      answer: 'Yes! We offer tiered discounts: 10% off orders over $500, 15% off over $1000, and 20% off over $2000. Contact us for custom quotes on larger orders.',
      category: 'customer-questions',
      tags: ['pricing', 'beauty-supplies', 'discounts'],
      status: 'published'
    },
    {
      question: 'What is our return policy?',
      answer: 'We accept returns within 30 days of purchase for unused items in original packaging. Custom orders and opened beauty products are non-returnable for hygiene reasons.',
      category: 'customer-questions',
      tags: ['returns', 'policy', 'customer-service'],
      status: 'published'
    }
  ];

  faqs.forEach(faq => {
    db.prepare(`
      INSERT INTO faq_items (id, question, answer, category, tags, createdBy, status, viewCount, relatedFaqIds, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      faq.question,
      faq.answer,
      faq.category,
      stringifyJsonField(faq.tags),
      adminId,
      faq.status,
      0,
      stringifyJsonField([]),
      formatDateForDb(new Date())
    );
  });

  console.log('FAQs created');

  // Create sales targets
  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  db.prepare(`
    INSERT INTO sales_targets (id, period, periodStart, periodEnd, targetRevenue, targetByCategory, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateId(),
    'month',
    formatDateForDb(monthStart),
    formatDateForDb(monthEnd),
    25000,
    stringifyJsonField({
      furniture: 10000,
      'beauty-supplies': 8000,
      'laser-machines': 7000
    }),
    formatDateForDb(new Date())
  );

  // Create sample sales metrics
  db.prepare(`
    INSERT INTO sales_metrics (id, date, actualRevenue, revenueByCategory, newCustomers, repeatCustomers, averageOrderValue, conversionRate, trafficSessions, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateId(),
    formatDateForDb(currentDate),
    18500,
    stringifyJsonField({
      furniture: 7200,
      'beauty-supplies': 6500,
      'laser-machines': 4800
    }),
    12,
    8,
    462.50,
    2.8,
    1420,
    'manual-entry'
  );

  console.log('Sales data created');

  // Create sample SEO tasks
  const seoTasks = [
    {
      title: 'Optimize product pages for laser machine keywords',
      description: 'Update meta descriptions, H1 tags, and image alt text for all laser machine product pages',
      category: 'on-page',
      priority: 'high',
      assignedTo: vaId,
      status: 'in-progress'
    },
    {
      title: 'Write blog post: Top 10 Beauty Supplies for Professional Salons',
      description: 'SEO-optimized blog content targeting "professional beauty supplies" keyword',
      category: 'content-creation',
      priority: 'medium',
      assignedTo: vaId,
      status: 'not-started'
    }
  ];

  seoTasks.forEach(task => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    db.prepare(`
      INSERT INTO seo_tasks (id, title, description, category, priority, assignedTo, status, dueDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      task.title,
      task.description,
      task.category,
      task.priority,
      task.assignedTo,
      task.status,
      formatDateForDb(dueDate),
      formatDateForDb(new Date())
    );
  });

  console.log('SEO tasks created');

  // Create sample social media campaign
  const campaignId = generateId();
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  db.prepare(`
    INSERT INTO social_campaigns (id, name, platforms, startDate, endDate, goal, targetAudience, contentTheme, postingSchedule, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    campaignId,
    'Summer Beauty Sale 2025',
    stringifyJsonField(['instagram', 'facebook', 'tiktok']),
    formatDateForDb(startDate),
    formatDateForDb(endDate),
    'Increase brand awareness and drive sales for summer beauty products',
    'Beauty salon owners and wellness professionals aged 25-45',
    'Summer vibes, professional beauty, self-care',
    stringifyJsonField([
      { day: 'Monday', time: '10:00' },
      { day: 'Wednesday', time: '14:00' },
      { day: 'Friday', time: '16:00' }
    ]),
    'active',
    formatDateForDb(new Date())
  );

  console.log('Social media campaign created');

  console.log('Database seeding completed successfully!');
}
