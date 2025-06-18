const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'streamflow.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
  
  // Get admin user data
  db.get(
    `SELECT id, username, email, is_admin, user_type, subscription_expired_at, max_streams, created_at 
     FROM users WHERE is_admin = 1`,
    [],
    async (err, row) => {
      if (err) {
        console.error('Error fetching admin user:', err.message);
      } else if (row) {
        console.log('=== ADMIN USER INFORMATION ===');
        console.log(`ID: ${row.id}`);
        console.log(`Username: ${row.username}`);
        console.log(`Email: ${row.email}`);
        console.log(`Is Admin: ${row.is_admin === 1 ? 'Yes' : 'No'}`);
        console.log(`User Type: ${row.user_type}`);
        console.log(`Max Streams: ${row.max_streams}`);
        console.log(`Subscription Expires: ${row.subscription_expired_at}`);
        console.log(`Created At: ${row.created_at}`);
        console.log('================================');
        
        // Test password
        console.log('Testing password verification...');
        const testPassword = 'Rahasia89$$';
        
        // Get the hashed password
        db.get(
          `SELECT password FROM users WHERE is_admin = 1`,
          [],
          async (err, passwordRow) => {
            if (err) {
              console.error('Error fetching password:', err.message);
            } else if (passwordRow) {
              try {
                const isPasswordValid = await bcrypt.compare(testPassword, passwordRow.password);
                console.log(`Password verification: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
                
                if (isPasswordValid) {
                  console.log('✅ Admin credentials updated successfully!');
                  console.log('You can now login with:');
                  console.log(`- Username: ${row.username}`);
                  console.log(`- Password: ${testPassword}`);
                  console.log(`- Email: ${row.email}`);
                } else {
                  console.log('❌ Password verification failed!');
                }
              } catch (error) {
                console.error('Error verifying password:', error);
              }
            }
            
            // Close database connection
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              } else {
                console.log('Database connection closed');
              }
            });
          }
        );
      } else {
        console.log('No admin user found!');
        db.close();
      }
    }
  );
}); 