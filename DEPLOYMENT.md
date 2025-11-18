# Vercel Deployment Guide - Salon Spot App

This guide will help you deploy your Salon Spot application to Vercel with PostgreSQL database support.

## Prerequisites

- A Vercel account ([signup at vercel.com](https://vercel.com/signup))
- Your code pushed to a GitHub repository
- Clerk account for authentication

## Step 1: Set Up Vercel Postgres

1. Go to [vercel.com](https://vercel.com) and sign in
2. Create a new project or select your existing project
3. Navigate to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name for your database (e.g., `salon-spot-db`)
7. Select your region (recommend Sydney for Australia)
8. Click **Create**

Vercel will automatically create the following environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 2: Run Database Migration

After creating your Postgres database:

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → Your Postgres database
3. Click on the **Data** tab
4. Click **Query**
5. Copy and paste the contents of `lib/db/migrations/001_initial_schema.sql`
6. Click **Run Query**

This will create all the necessary tables and indexes.

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Clerk Authentication (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bXVzaWNhbC1nb2F0LTk4LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_slaMuPSvCf4n4YB5oiEQXVWjuRh421fjZDtE1dkpzR
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Note:** The Postgres environment variables (`POSTGRES_URL`, etc.) are automatically added when you create a Vercel Postgres database.

## Step 4: Deploy via GitHub

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Vercel will auto-detect Next.js
5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 5: Verify Deployment

1. Wait for deployment to complete
2. Click on the deployment URL
3. Test the application
4. Check database connectivity by viewing the dashboard

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | Auto-created by Vercel |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page URL | Yes |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | Yes |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | Yes |

## Local Development vs Production

### Local Development
- Uses **SQLite** (`salon-spot.db` file)
- No PostgreSQL environment variables needed
- Fast and simple for development

### Production (Vercel)
- Uses **Vercel Postgres**
- Requires `POSTGRES_URL` environment variable
- Automatically detected and used by the app

The app automatically detects which database to use based on the presence of `POSTGRES_URL`.

## Seeding Production Database

To seed your production database with initial data:

1. Create a seed script for PostgreSQL
2. Connect to your Vercel Postgres database
3. Run the seed script via Vercel's Query interface or programmatically

Example using Vercel CLI:
```bash
vercel env pull .env.production
# Then run your seed script locally pointing to production
```

## Troubleshooting

### Database Connection Issues
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check database is in the same region as your deployment
- Review Vercel function logs for connection errors

### Migration Failures
- Ensure SQL syntax is PostgreSQL-compatible
- Check for conflicting table names
- Verify foreign key relationships are correct

### Clerk Authentication Issues
- Verify all Clerk environment variables are set
- Check Clerk dashboard for webhook configuration
- Ensure URLs match your deployment domain

## Updating Clerk Webhook URLs

After deployment, update your Clerk webhook URLs:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks**
4. Update the endpoint URL to: `https://your-vercel-domain.vercel.app/api/webhooks/clerk`
5. Save changes

## Performance Optimization

- Enable Vercel Edge Caching for static assets
- Use ISR (Incremental Static Regeneration) for dashboard pages
- Consider connection pooling for database queries
- Monitor function execution time in Vercel dashboard

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Clerk secret keys are not exposed in client-side code
- [ ] Database credentials are not committed to Git
- [ ] CORS is properly configured for API routes
- [ ] Rate limiting is enabled for sensitive endpoints

## Support

For issues with:
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Clerk**: [Clerk Docs](https://clerk.com/docs)
- **PostgreSQL**: [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)

---

**Last Updated:** November 18, 2025
**Author:** Ben Carter (ben@yoonet.io)
