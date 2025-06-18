#!/bin/bash

echo "=== Cleanup SQLite3 Fix Files ==="
echo "Removing temporary fix scripts..."

# Remove fix scripts
rm -f fix-sqlite3-linux.sh
rm -f fix-sqlite3-alternative.sh
rm -f fix-sqlite3-simple.sh
rm -f make-executable.sh
rm -f SQLITE3_FIX_README.md
rm -f cleanup-fix-files.sh

echo "✅ All fix files have been removed"
echo "SQLite3 issue should now be resolved"
echo ""
echo "To check if everything is working:"
echo "1. pm2 status"
echo "2. pm2 logs livenoribet"
echo "3. Visit your application URL" 