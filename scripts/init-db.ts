import { initializeDatabase } from '../src/lib/db';
import { seedDatabase } from '../src/lib/db/seed';

console.log('Initializing database...');

try {
  initializeDatabase();
  console.log('Database schema created successfully!');

  console.log('\nSeeding database with sample data...');
  seedDatabase();

  console.log('\nDatabase setup complete!');
  process.exit(0);
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}
