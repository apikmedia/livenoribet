#!/bin/bash

echo "=== SQLite3 Linux Fix Script ==="
echo "Fixing SQLite3 native binding issues for Node.js v23.11.0"

# Check current Node.js version
echo "Current Node.js version:"
node --version

# Check current directory
echo "Current directory: $(pwd)"

# Stop any running PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all || echo "No PM2 processes to stop"

# Remove existing node_modules and package-lock.json
echo "Cleaning up existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies with rebuild
echo "Installing dependencies..."
npm install

# Rebuild SQLite3 specifically
echo "Rebuilding SQLite3 for current Node.js version..."
npm rebuild sqlite3

# Alternative: Install SQLite3 with specific version that supports Node.js 23
echo "Installing compatible SQLite3 version..."
npm uninstall sqlite3
npm install sqlite3@5.1.7 --build-from-source

# If still fails, try with node-pre-gyp
echo "Attempting to rebuild with node-pre-gyp..."
npx node-pre-gyp rebuild --target_arch=x64 --target_platform=linux --target=$(node --version | cut -d'v' -f2) || echo "node-pre-gyp rebuild failed, continuing..."

# Check if SQLite3 is working
echo "Testing SQLite3 installation..."
node -e "
try {
  const sqlite3 = require('sqlite3');
  console.log('✅ SQLite3 loaded successfully');
  console.log('SQLite3 version:', sqlite3.VERSION);
} catch (err) {
  console.log('❌ SQLite3 failed to load:', err.message);
  process.exit(1);
}
"

echo "=== Fix completed ==="
echo "You can now start the application with: pm2 start app.js --name livenoribet" 