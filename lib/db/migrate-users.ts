import db from './index';

console.log('Running user migration...');

try {
  // Add new columns to users table
  try {
    db.exec(`ALTER TABLE users ADD COLUMN imageUrl TEXT`);
    console.log('Added imageUrl column to users');
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      throw e;
    }
    console.log('imageUrl column already exists');
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN updatedAt DATETIME`);
    console.log('Added updatedAt column to users');
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      throw e;
    }
    console.log('updatedAt column already exists');
  }

  // Add createdBy column to tasks table
  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN createdBy TEXT REFERENCES users(id) ON DELETE SET NULL`);
    console.log('Added createdBy column to tasks');
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      throw e;
    }
    console.log('createdBy column already exists');
  }

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
