import { sql } from '@vercel/postgres';

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format dates for PostgreSQL
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

// Initialize the database schema (for Vercel Postgres)
export async function initializeDatabase() {
  const fs = await import('fs');
  const path = await import('path');

  const migrationPath = path.join(process.cwd(), 'lib', 'db', 'migrations', '001_initial_schema.sql');
  const schema = fs.readFileSync(migrationPath, 'utf-8');

  // Execute schema
  await sql.query(schema);

  console.log('PostgreSQL database initialized successfully');
}

// Query helpers that match SQLite interface
export const db = {
  prepare: (query: string) => {
    return {
      all: async (...params: any[]) => {
        const result = await sql.query(query, params);
        return result.rows;
      },
      get: async (...params: any[]) => {
        const result = await sql.query(query, params);
        return result.rows[0];
      },
      run: async (...params: any[]) => {
        const result = await sql.query(query, params);
        return result;
      }
    };
  }
};

export { sql };
export default db;
