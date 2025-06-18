const { db, checkIfUsersExist } = require('../db/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class User {
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Database error in findById:', err);
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userId = uuidv4();
      
      // Set trial period (1 day)
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 1);
      
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (
            id, username, password, email, avatar_path,
            user_type, subscription_expired_at, max_streams, is_admin
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            userData.username,
            hashedPassword,
            userData.email || null,
            userData.avatar_path || null,
            'trial',
            trialExpiry.toISOString(),
            5, // Default max streams
            0  // Not admin by default
          ],
          function (err) {
            if (err) {
              console.error("DB error during user creation:", err);
              return reject(err);
            }
            console.log("User created successfully with ID:", userId);
            resolve({ 
              id: userId, 
              username: userData.username,
              email: userData.email,
              user_type: 'trial',
              subscription_expired_at: trialExpiry.toISOString(),
              max_streams: 5,
              is_admin: 0
            });
          }
        );
      });
    } catch (error) {
      console.error("Error in User.create:", error);
      throw error;
    }
  }

  static update(userId, userData) {
    const fields = [];
    const values = [];
    Object.entries(userData).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: userId, ...userData });
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, username, email, user_type, subscription_expired_at, max_streams, is_admin, created_at FROM users',
        [],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getActiveStreams(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM streams WHERE user_id = ? AND status = "active"',
        [userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row.count);
        }
      );
    });
  }

  static async getUserById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, user_type, subscription_expired_at, max_streams, is_admin, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
  }

  static async updateUser(id, data) {
    const fields = [];
    const values = [];
    
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.user_type !== undefined) {
      fields.push('user_type = ?');
      values.push(data.user_type);
    }
    if (data.subscription_expired_at !== undefined) {
      fields.push('subscription_expired_at = ?');
      values.push(data.subscription_expired_at);
    }
    if (data.max_streams !== undefined) {
      fields.push('max_streams = ?');
      values.push(data.max_streams);
    }
    
    values.push(id);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          resolve({ id, ...data });
        }
      );
    });
  }

  static async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = uuidv4();
    
    // Set default expiry date based on user_type
    let expiryDate = new Date();
    if (data.user_type === 'premium') {
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month for premium
    } else {
      expiryDate.setDate(expiryDate.getDate() + 1); // 1 day for trial
    }
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (
          id, username, password, email, user_type, 
          subscription_expired_at, max_streams, is_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.username,
          hashedPassword,
          data.email,
          data.user_type || 'trial',
          data.subscription_expired_at || expiryDate.toISOString(),
          data.max_streams || 5,
          0 // Not admin by default
        ],
        function(err) {
          if (err) reject(err);
          resolve({ id: userId });
        }
      );
    });
  }

  static async deleteUser(id) {
    return new Promise((resolve, reject) => {
      // Begin transaction to ensure data consistency
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // First delete all streams associated with this user
        db.run('DELETE FROM streams WHERE user_id = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          // Delete stream history records if table exists
          db.run('DELETE FROM stream_history WHERE user_id = ?', [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }
            
            // Finally delete the user
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }
              
              // Commit the transaction if all operations succeeded
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
                
                resolve({ 
                  deleted: true, 
                  id: id, 
                  rowsAffected: this.changes 
                });
              });
            });
          });
        });
      });
    });
  }
}

module.exports = User;