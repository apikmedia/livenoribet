#!/bin/bash

echo "Making SQLite3 fix scripts executable..."
chmod +x fix-sqlite3-linux.sh
chmod +x fix-sqlite3-alternative.sh  
chmod +x fix-sqlite3-simple.sh

echo "All scripts are now executable"
echo ""
echo "Available scripts:"
echo "1. ./fix-sqlite3-linux.sh (Rebuild SQLite3)"
echo "2. ./fix-sqlite3-alternative.sh (Use better-sqlite3)"
echo "3. ./fix-sqlite3-simple.sh (Downgrade to Node.js 20 - RECOMMENDED)"
echo ""
echo "Recommendation: Use script #3 for maximum stability" 