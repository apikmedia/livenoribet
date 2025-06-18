const { db } = require('../db/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createAdminUser() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin user exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating to admin privileges...');
      
      // Update existing user to admin
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET 
            user_type = 'premium',
            is_admin = 1,
            max_streams = 999,
            subscription_expired_at = ?
          WHERE username = ?`,
          [
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            'admin'
          ],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });
      
      console.log('Admin privileges updated successfully');
      console.log('Username: admin');
      console.log('Please use your existing password to login');
    } else {
      console.log('Creating new admin user...');
      
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Set admin expiry date (1 year from now)
      const adminExpiry = new Date();
      adminExpiry.setFullYear(adminExpiry.getFullYear() + 1);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (
            id, username, password, email, user_type, 
            subscription_expired_at, max_streams, is_admin
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            adminId,
            'admin',
            hashedPassword,
            'admin@example.com',
            'premium',
            adminExpiry.toISOString(),
            999, // Unlimited streams for admin
            1    // is_admin = true
          ],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });
      
      console.log('Admin user created successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Please change the password after first login!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error managing admin user:', err);
    process.exit(1);
  }
}

createAdminUser(); 