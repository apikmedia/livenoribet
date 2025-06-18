const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'streamflow.db');

// Kredensial admin baru
const newAdminCredentials = {
  username: 'ahmadila',
  email: 'hajir89@gmail.com',
  password: 'Rahasia89$$'
};

// Set expiry date untuk 1 tahun ke depan
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
  
  try {
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newAdminCredentials.password, 10);
    console.log('Password hashed successfully');
    
    // Update user admin berdasarkan is_admin = 1
    db.run(
      `UPDATE users SET 
        username = ?, 
        email = ?, 
        password = ?, 
        user_type = 'premium', 
        subscription_expired_at = ?, 
        max_streams = 999
       WHERE is_admin = 1`,
      [
        newAdminCredentials.username,
        newAdminCredentials.email,
        hashedPassword,
        oneYearFromNow.toISOString()
      ],
      function(err) {
        if (err) {
          console.error('Error updating admin credentials:', err.message);
        } else {
          console.log(`Admin credentials updated successfully!`);
          console.log(`Updated ${this.changes} row(s)`);
          console.log('New credentials:');
          console.log(`- Username: ${newAdminCredentials.username}`);
          console.log(`- Email: ${newAdminCredentials.email}`);
          console.log(`- Password: ${newAdminCredentials.password}`);
          console.log(`- Expiry: ${oneYearFromNow.toISOString()}`);
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
  } catch (error) {
    console.error('Error hashing password:', error);
    db.close();
  }
}); 