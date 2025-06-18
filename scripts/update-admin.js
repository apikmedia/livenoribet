const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'streamflow.db');

// Set expiry date untuk 1 tahun ke depan
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
  
  // Update user admin
  db.run(
    `UPDATE users SET 
      is_admin = 1, 
      user_type = 'premium', 
      subscription_expired_at = ?, 
      max_streams = 999
     WHERE username = 'admin'`,
    [oneYearFromNow.toISOString()],
    function(err) {
      if (err) {
        console.error('Error updating admin:', err.message);
      } else {
        console.log(`Admin updated: ${this.changes} row(s) modified`);
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
}); 