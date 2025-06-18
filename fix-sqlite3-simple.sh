#!/bin/bash

echo "=== SQLite3 Simple Fix Script ==="
echo "Using Node Version Manager to use compatible Node.js version"

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "Installing NVM (Node Version Manager)..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Current Node.js version: $(node --version)"

# Install and use Node.js 20 (LTS and more compatible with SQLite3)
echo "Installing Node.js 20 LTS..."
nvm install 20
nvm use 20

echo "New Node.js version: $(node --version)"

# Stop any running PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all || echo "No PM2 processes to stop"

# Clean and reinstall dependencies
echo "Cleaning node_modules..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies with Node.js 20..."
npm install

# Test SQLite3
echo "Testing SQLite3 with Node.js 20..."
node -e "
try {
  const sqlite3 = require('sqlite3');
  console.log('✅ SQLite3 loaded successfully with Node.js 20');
  console.log('SQLite3 version:', sqlite3.VERSION);
} catch (err) {
  console.log('❌ SQLite3 still failed:', err.message);
  process.exit(1);
}
"

# Set Node.js 20 as default
echo "Setting Node.js 20 as default..."
nvm alias default 20

echo "=== Simple fix completed ==="
echo "Node.js 20 is now the default version"
echo "You can now start the application with: pm2 start app.js --name livenoribet" 