#!/bin/bash

echo "=== SQLite3 Alternative Fix Script ==="
echo "Switching to better-sqlite3 for Node.js v23.11.0 compatibility"

# Stop any running PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all || echo "No PM2 processes to stop"

# Backup current database
echo "Backing up database..."
cp db/streamflow.db db/streamflow.db.backup.$(date +%Y%m%d_%H%M%S) || echo "No database to backup"

# Remove problematic sqlite3
echo "Removing sqlite3..."
npm uninstall sqlite3

# Install better-sqlite3 (more reliable for newer Node.js versions)
echo "Installing better-sqlite3..."
npm install better-sqlite3@9.6.0

# Create a compatibility wrapper for better-sqlite3
echo "Creating compatibility wrapper..."
cat > db/sqlite-wrapper.js << 'EOF'
// Compatibility wrapper to use better-sqlite3 with sqlite3 API
const Database = require('better-sqlite3');

class SQLite3Wrapper {
  constructor(path, callback) {
    try {
      this.db = new Database(path);
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }

  run(sql, params, callback) {
    try {
      const result = this.db.prepare(sql).run(params || []);
      if (callback) {
        callback.call({ changes: result.changes, lastID: result.lastInsertRowid }, null);
      }
    } catch (err) {
      if (callback) callback(err);
    }
  }

  get(sql, params, callback) {
    try {
      const result = this.db.prepare(sql).get(params || []);
      if (callback) callback(null, result);
    } catch (err) {
      if (callback) callback(err, null);
    }
  }

  all(sql, params, callback) {
    try {
      const result = this.db.prepare(sql).all(params || []);
      if (callback) callback(null, result);
    } catch (err) {
      if (callback) callback(err, null);
    }
  }

  serialize(callback) {
    if (callback) callback();
  }

  close(callback) {
    try {
      this.db.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

module.exports = {
  Database: SQLite3Wrapper,
  verbose: () => ({ Database: SQLite3Wrapper })
};
EOF

# Update database.js to use the wrapper
echo "Updating database.js..."
sed -i "s/require('sqlite3')/require('.\/sqlite-wrapper')/g" db/database.js

# Test the new setup
echo "Testing better-sqlite3 installation..."
node -e "
try {
  const sqlite3 = require('./db/sqlite-wrapper');
  console.log('✅ better-sqlite3 wrapper loaded successfully');
  
  // Test database connection
  const db = new sqlite3.Database('./db/streamflow.db', (err) => {
    if (err) {
      console.log('❌ Database connection failed:', err.message);
    } else {
      console.log('✅ Database connection successful');
    }
  });
} catch (err) {
  console.log('❌ better-sqlite3 failed to load:', err.message);
  process.exit(1);
}
"

echo "=== Alternative fix completed ==="
echo "You can now start the application with: pm2 start app.js --name livenoribet" 