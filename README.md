# The Salon Spot - VA Management & Operations Platform

A comprehensive Next.js-based management application for managing offshore VA operations for The Salon Spot eCommerce business.

## Project Overview

This platform consolidates training, customer relationship management, sales pipeline, content management, and outreach coordination to help Dominique Alexa Carter efficiently manage her VA team and scale The Salon Spot operations.

**Current Status:** MVP Dashboard Complete with 7 Core Modules

## Features Implemented

### ✅ Database & Backend
- **SQLite Database** with complete schema for all 7 modules
- **22 Database Tables** covering users, training, customers, opportunities, suppliers, FAQs, SEO, social media, and sales tracking
- **Database Seeding** with realistic sample data for development
- **API Routes** for CRUD operations across all modules:
  - Customers Management
  - Opportunities & Pipeline
  - Training Modules & Progress
  - FAQs & Knowledge Base
  - Supplier Contacts & Outreach
  - Dashboard Statistics

### ✅ Executive Dashboard
- **Revenue Tracking** - Current vs. target with visual progress bars
- **Pipeline Value** - Total opportunity value and count
- **VA Training Progress** - Completion percentage and module tracking
- **Upcoming Follow-ups** - Automated reminders for customer and supplier outreach
- **Pipeline by Stage** - Visual breakdown of opportunities by stage
- **Revenue by Category** - Furniture, Beauty Supplies, Laser Machines with targets
- **Quick Actions** - Direct links to key modules

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Server Components)
- **React 19**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for backend logic
- **SQLite** with better-sqlite3
- **Zod** for schema validation

### Development Tools
- **tsx** for running TypeScript scripts
- **ESLint** for code quality

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Navigate to the project:**
   ```bash
   cd /Users/ben/Desktop/salon-spot-app
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Initialize the database** (already done):
   ```bash
   npm run db:init
   ```
   This creates the SQLite database, sets up all tables, and seeds with sample data.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
salon-spot-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── customers/        # Customer CRUD operations
│   │   ├── opportunities/    # Opportunity CRUD operations
│   │   ├── training/         # Training modules API
│   │   ├── faqs/             # FAQ management
│   │   ├── suppliers/        # Supplier contacts API
│   │   └── dashboard/        # Dashboard statistics
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main dashboard page
├── lib/                      # Shared utilities
│   ├── db/                   # Database layer
│   │   ├── index.ts          # Database connection & helpers
│   │   ├── schema.sql        # Database schema
│   │   └── seed.ts           # Seed data script
│   └── utils.ts              # Utility functions
├── types/                    # TypeScript type definitions
│   └── index.ts              # All app types
├── data/                     # SQLite database file
│   └── salon-spot.db         # SQLite database
├── scripts/                  # Utility scripts
│   └── init-db.ts            # Database initialization
└── public/                   # Static assets
```

## Database Schema

The application uses SQLite with the following main tables:

### Core Tables
- **users** - User accounts (admin, VA, viewer roles)
- **customers** - Customer database with contact info
- **opportunities** - Sales pipeline opportunities
- **opportunity_activity** - Activity log for opportunities
- **transactions** - Completed sales transactions

### Training System
- **training_modules** - Training content and courses
- **training_resources** - Training materials and links
- **training_progress** - VA progress tracking

### Supplier Management
- **supplier_contacts** - Supplier database
- **outreach_log** - Communication history

### Content & Knowledge
- **faq_items** - Knowledge base with approval workflow

### SEO Management
- **seo_tasks** - SEO task tracking
- **keyword_targets** - Keyword rankings
- **seo_metrics** - SEO performance data

### Social Media
- **social_campaigns** - Campaign planning
- **social_posts** - Content calendar
- **social_metrics** - Engagement metrics

### Sales Tracking
- **sales_targets** - Revenue targets by period
- **sales_metrics** - Actual performance data

## Sample Data

The database is pre-seeded with:
- 2 users (Admin: Dominique, VA User)
- 6 training modules
- 3 customers with opportunities
- 3 supplier contacts
- 3 published FAQs
- 2 SEO tasks
- 1 active social media campaign
- Current month sales target and metrics

## API Endpoints

### Customers
- `GET /api/customers` - List all customers (with search/filter)
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer details
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Opportunities
- `GET /api/opportunities` - List opportunities (filterable by stage/customer)
- `POST /api/opportunities` - Create opportunity
- `GET /api/opportunities/:id` - Get opportunity details
- `PATCH /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Training
- `GET /api/training/modules` - List all training modules
- `POST /api/training/modules` - Create training module

### FAQs
- `GET /api/faqs` - List FAQs (with search/status/category filters)
- `POST /api/faqs` - Create FAQ

### Suppliers
- `GET /api/suppliers` - List suppliers (filterable)
- `POST /api/suppliers` - Create supplier contact

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Next Steps for Development

### Phase 1: Complete Core Modules (Recommended Next Steps)
- [ ] Build customer management UI with table and forms
- [ ] Create sales pipeline Kanban board with drag-and-drop
- [ ] Build training module UI for VAs with progress tracking
- [ ] Create FAQ management interface with approval workflow

### Phase 2: Advanced Features
- [ ] Implement authentication with NextAuth.js
- [ ] Add role-based access control (Admin vs VA)
- [ ] Create supplier outreach management UI
- [ ] Build SEO task management interface
- [ ] Implement social media campaign planner

### Phase 3: Integrations
- [ ] Shopify API integration for revenue data
- [ ] Email notifications for follow-ups
- [ ] Data export functionality (CSV/Excel)
- [ ] Advanced charts with Recharts

### Phase 4: Polish & Deploy
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Deploy to Vercel
- [ ] Set up production database (PostgreSQL or managed SQLite)

## Database Management

### Reset Database
To reset the database and reseed with fresh data:
```bash
rm data/salon-spot.db
npm run db:init
```

### View Database
You can use any SQLite viewer to inspect the database:
```bash
sqlite3 data/salon-spot.db
```

## Business Context

### Company: The Salon Spot
- **Type:** eCommerce drop shipping (furniture, beauty supplies, laser machines)
- **Age:** 5 months
- **Current Revenue:** $76k gross sales
- **Target:** $200-300k annually
- **Platform:** Shopify
- **Owner:** Dominique Alexa Carter

### VA Structure
- **Provider:** Yoonet (Philippines-based BPO)
- **Cost:** $1,800-$3,000/month AUD
- **Key Responsibilities:** Social media, live chat, email marketing, supplier outreach, website management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:init` - Initialize and seed database
- `npm run lint` - Run ESLint

## Contributing

This is an internal tool for The Salon Spot. For questions or issues, contact Ben Carter at ben@yoonet.io.

## License

Private - The Salon Spot & Yoonet

---

**Built with** Next.js, TypeScript, Tailwind CSS, and SQLite
**Generated by** Claude Code
**Last Updated:** November 17, 2025
