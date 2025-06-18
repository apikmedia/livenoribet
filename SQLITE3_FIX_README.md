# SQLite3 Fix untuk Node.js v23.11.0

## Masalah
Aplikasi LiveNoRibet mengalami error SQLite3 native binding di server Linux dengan Node.js v23.11.0:

```
Error: Cannot find module '/home/ahmadila/livenoribet/node_modules/sqlite3/lib/binding/node-v115-linux-x64/node_sqlite3.node'
```

## Penyebab
- Node.js v23.11.0 menggunakan V8 engine yang lebih baru
- SQLite3 v5.1.7 belum memiliki pre-compiled binary untuk Node.js v23
- Native binding perlu di-compile ulang atau menggunakan versi Node.js yang kompatibel

## Solusi (Pilih salah satu)

### Solusi 1: Rebuild SQLite3 (Rekomendasi)
```bash
chmod +x fix-sqlite3-linux.sh
./fix-sqlite3-linux.sh
```

**Langkah yang dilakukan:**
1. Stop PM2 processes
2. Hapus node_modules dan package-lock.json
3. Clear npm cache
4. Install ulang dependencies
5. Rebuild SQLite3 untuk Node.js v23
6. Test koneksi database

### Solusi 2: Gunakan better-sqlite3 (Alternatif)
```bash
chmod +x fix-sqlite3-alternative.sh
./fix-sqlite3-alternative.sh
```

**Langkah yang dilakukan:**
1. Ganti sqlite3 dengan better-sqlite3
2. Buat compatibility wrapper
3. Update database.js
4. Test koneksi database

### Solusi 3: Downgrade ke Node.js 20 LTS (Paling Aman)
```bash
chmod +x fix-sqlite3-simple.sh
./fix-sqlite3-simple.sh
```

**Langkah yang dilakukan:**
1. Install NVM (Node Version Manager)
2. Install Node.js 20 LTS
3. Set Node.js 20 sebagai default
4. Reinstall dependencies
5. Test SQLite3

## Rekomendasi
1. **Gunakan Solusi 3** (Node.js 20 LTS) untuk stabilitas maksimal
2. Node.js 20 adalah versi LTS yang lebih stabil
3. Sebagian besar package npm sudah kompatibel dengan Node.js 20
4. Lebih sedikit risiko compatibility issues

## Setelah Fix
1. Start aplikasi: `pm2 start app.js --name livenoribet`
2. Check status: `pm2 status`
3. View logs: `pm2 logs livenoribet`
4. Restart jika perlu: `pm2 restart livenoribet`

## Troubleshooting
Jika masih ada masalah:
1. Check Node.js version: `node --version`
2. Check SQLite3: `node -e "console.log(require('sqlite3').VERSION)"`
3. Check database file: `ls -la db/streamflow.db`
4. Check permissions: `chmod 755 db/streamflow.db`

## Backup
Sebelum menjalankan fix, backup database:
```bash
cp db/streamflow.db db/streamflow.db.backup.$(date +%Y%m%d_%H%M%S)
``` 