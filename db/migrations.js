const { db } = require('./database');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Tambah kolom email
    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN email TEXT;
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Added email column');
          resolve();
        }
      });
    });

    // Tambah kolom untuk user type dan subscription
    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'trial';
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Added user_type column');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN subscription_expired_at DATETIME;
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Added subscription_expired_at column');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN max_streams INTEGER DEFAULT 5;
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Added max_streams column');
          resolve();
        }
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Added is_admin column');
          resolve();
        }
      });
    });

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

runMigrations(); 