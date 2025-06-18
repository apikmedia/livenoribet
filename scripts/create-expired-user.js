const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'db', 'streamflow.db');

// Set expiry date untuk kemarin (sudah expired)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database');
  
  try {
    // Hash password
    const password = 'Password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Buat user dengan subscription expired
    db.run(
      `INSERT INTO users (
        id, username, password, email, avatar_path,
        user_type, subscription_expired_at, max_streams, is_admin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        'expired',
        hashedPassword,
        'expired@example.com',
        null,
        'trial',
        yesterday.toISOString(),
        5,
        0
      ],
      function(err) {
        if (err) {
          console.error('Error creating expired user:', err.message);
        } else {
          console.log(`Expired user created with ID: ${this.lastID}`);
          console.log('Username: expired');
          console.log('Password: Password123');
          console.log('Subscription expired at:', yesterday.toISOString());
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
    console.error('Error:', error);
    db.close();
  }
}); 