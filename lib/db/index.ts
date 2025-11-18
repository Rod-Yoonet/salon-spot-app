// Database connection that works with both SQLite (dev) and PostgreSQL (production)
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Check if we're using PostgreSQL (Vercel Postgres in production)
const isProduction = process.env.POSTGRES_URL !== undefined;

let db: any;

if (!isProduction) {
  // Use SQLite for local development
  const dbPath = path.join(process.cwd(), 'salon-spot.db');
  const dbDir = path.dirname(dbPath);

  // Ensure the data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create or open the database
  db = new Database(dbPath, { verbose: console.log });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
} else {
  // Use PostgreSQL for production
  // Import will be done dynamically when needed
  console.log('Using PostgreSQL for production');
}

// Initialize the database schema
export function initializeDatabase() {
  if (!isProduction) {
    // SQLite initialization
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema - split by statements and run each
    db.exec(schema);

    console.log('SQLite database initialized successfully');
  } else {
    // PostgreSQL initialization is handled by Vercel
    console.log('PostgreSQL database should be initialized via Vercel dashboard or migration scripts');
  }
}

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format dates
export function formatDateForDb(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

// Helper to parse JSON fields safely
export function parseJsonField<T>(field: string | null): T | null {
  if (!field) return null;
  try {
    return JSON.parse(field) as T;
  } catch {
    return null;
  }
}

// Helper to stringify JSON fields
export function stringifyJsonField(data: unknown): string {
  return JSON.stringify(data);
}

export { isProduction };
export default db;
