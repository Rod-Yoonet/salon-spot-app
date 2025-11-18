import db, { formatDateForDb } from './index';

const ADMIN_EMAIL = 'ben@yoonet.io';

console.log(`Setting ${ADMIN_EMAIL} as admin...`);

try {
  // Check if user exists
  const checkStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = checkStmt.get(ADMIN_EMAIL) as any;

  if (user) {
    // Update existing user to admin
    const updateStmt = db.prepare('UPDATE users SET role = ?, updatedAt = ? WHERE email = ?');
    updateStmt.run('admin', formatDateForDb(new Date()), ADMIN_EMAIL);
    console.log(`✅ Updated ${ADMIN_EMAIL} to admin role`);
    console.log('User details:', user);
  } else {
    console.log(`❌ User ${ADMIN_EMAIL} not found in database.`);
    console.log('Please sign up first, then run this script again.');
  }
} catch (error) {
  console.error('Error setting admin:', error);
  process.exit(1);
}
