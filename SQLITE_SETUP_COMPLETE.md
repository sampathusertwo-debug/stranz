# SQLite Local Database Setup - Complete! ✅

## Overview
Your TransportBook app now uses **SQLite for local development** and can switch to Supabase for production.

## Configuration

### Environment Setup (.env.local)
```env
# Set to 'false' or leave empty to use SQLite locally
USE_SUPABASE=false

# Only needed if USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

## Database Location
- **Local SQLite**: `data/transport.db` (created automatically)
- **Production**: Supabase PostgreSQL

## What Was Installed
```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

## How It Works

### Automatic Database Selection
The app automatically chooses the right database:
- **Local Development** (USE_SUPABASE=false): Uses SQLite file in `data/` folder
- **Production** (NODE_ENV=production): Uses Supabase

### Database Schema
All tables are created automatically on first run:
- ✅ drivers
- ✅ trucks  
- ✅ parties
- ✅ invoices
- ✅ expenses
- ✅ tips

### Updated Files
All API routes now support both databases:
- `src/lib/db.ts` - Unified database interface
- `src/app/api/drivers/*` - Updated
- `src/app/api/trucks/*` - Updated
- `src/app/api/parties/*` - Updated
- `src/app/api/invoices/*` - Updated
- `src/app/api/expenses/*` - Updated
- `src/app/api/tips/*` - Updated

## Testing

### Start Development Server
```bash
npm run dev
```

### Verify SQLite is Working
1. Open [http://localhost:3000/drivers](http://localhost:3000/drivers)
2. Click "Add Driver" and create a test driver
3. Check that `data/transport.db` was created
4. Your data is now persisted locally!

### View SQLite Database
Install a SQLite viewer (optional):
```bash
npm install -g sqlite3
sqlite3 data/transport.db
# Then: SELECT * FROM drivers;
```

Or use VS Code extensions:
- "SQLite Viewer" by Florian Klampfer
- "SQLite" by alexcvzz

## Switching to Supabase

When ready for production:

1. Update `.env.local`:
   ```env
   USE_SUPABASE=true
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
   ```

2. Run the Supabase schema from `SETUP_SUPABASE.md`

3. Restart the dev server

## Benefits

✅ **No Internet Required**: Work completely offline  
✅ **Fast**: No network latency  
✅  **Simple**: No external setup needed  
✅ **Persistent**: Data saved to file system  
✅ **Production Ready**: Easy switch to Supabase  

## Troubleshooting

### If you see "Cannot find module 'better-sqlite3'"
```bash
npm install better-sqlite3 --save
npm install --save-dev @types/better-sqlite3
```

### If data isn't persisting
Check that `data/transport.db` exists in your project root.

### Clear cache and restart
```bash
Remove-Item -Path ".next" -Recurse -Force
npm run dev
```

## Next Steps

1. ✅ SQLite is configured and ready
2. Start the dev server: `npm run dev`
3. Test CRUD operations on any page
4. Your data will persist in `data/transport.db`

Enjoy local development with zero external dependencies! 🎉
