# 🚀 Quick Start Guide - Texas Market Launch

## Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- Database named `olx_database` created

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Backend
cd olx-backend
npm install

# Frontend (in new terminal)
cd olx-website
npm install
```

### 2. Configure Environment Variables

**Backend** (`olx-backend/config.env`):
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/olx_database
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

**Frontend** (`olx-website/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Database Migration

```bash
cd olx-backend
node scripts/run-migration.js
```

**Expected Output:**
```
🗄️  Database Migration Tool
Database: olx_database
✅ Database connection successful
🚀 Executing migration...
✅ Migration completed successfully!
```

**Verify:**
```bash
psql -U your_user -d olx_database -c "SELECT COUNT(*) FROM categories;"
```
Should return: `12`

### 4. Start Backend Server

```bash
cd olx-backend
npm start
```

**Expected Output:**
```
✅ Database connected successfully!
✅ Server is running on port 5000
🔌 WebSocket server is ready!
```

**Test:**
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### 5. Start Frontend Server

```bash
cd olx-website
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.4.6
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 6. Verify Setup

Open browser to: **http://localhost:3000**

**Check:**
- [ ] Homepage loads with "Texas's #1 Marketplace" header
- [ ] Categories show 12 options
- [ ] Click "Search" - filter sidebar appears
- [ ] Click "Post Ad" - Texas cities in location dropdown
- [ ] All prices show $ (not ₹)

---

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -l | grep olx_database`
3. Check credentials in `config.env`

### Issue: "Migration fails - relation already exists"
**Solution:** Migration already ran. Safe to continue.

### Issue: "Frontend can't connect to backend"
**Solutions:**
1. Ensure backend is running on port 5000
2. Check CORS settings in `olx-backend/server.js`
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: "No ads showing on homepage"
**Solutions:**
1. Backend must be running
2. Check browser console for API errors
3. Fallback data will show if backend is down (this is normal)

---

## Testing the Platform

### Test 1: Search Functionality
1. Go to http://localhost:3000/search
2. Select category "Electronics"
3. Set price range: $100 - $1000
4. Select location: "Austin"
5. **Verify:** URL updates with query params
6. **Verify:** Results filtered correctly

### Test 2: Post Ad
1. Go to http://localhost:3000/post-ad
2. Fill form:
   - Title: "iPhone 15 Pro Max"
   - Category: "Electronics"
   - Price: "1100"
   - Description: "Brand new, sealed"
   - Location: Select "Austin, TX"
   - Upload images (optional)
3. Submit
4. **Verify:** Ad appears in search results

### Test 3: Mobile View
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Switch to mobile view
4. Go to search page
5. **Verify:** Filter button appears (floating)
6. Click filter button
7. **Verify:** Drawer opens from left

---

## Development Workflow

### Making Changes

**Frontend Changes:**
```bash
cd olx-website
npm run dev
# Edit files in src/
# Changes auto-reload in browser
```

**Backend Changes:**
```bash
cd olx-backend
npm run dev
# Edit files in routes/, models/, etc.
# Server auto-restarts on changes
```

**Database Changes:**
1. Create new migration file in `migrations/`
2. Run: `node scripts/run-migration.js new-migration.sql`
3. Verify changes in database

### Adding New Features

**Example: Add new category**

1. Edit `olx-website/src/lib/constants.ts`:
```typescript
CATEGORIES.push({
  id: 'automotive-services',
  name: 'Automotive Services',
  slug: 'automotive-services',
  icon: 'Wrench',
  description: 'Auto repair, detailing, and maintenance',
  color: 'bg-gray-100 text-gray-700',
  subcategories: ['Oil Change', 'Tire Service', 'Detailing', 'Repair']
});
```

2. Run migration to add to database:
```sql
INSERT INTO categories (name, slug, icon, description, color, display_order)
VALUES ('Automotive Services', 'automotive-services', 'Wrench',
        'Auto repair, detailing, and maintenance',
        'bg-gray-100 text-gray-700', 13);
```

3. Test: Category appears in dropdowns

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Run migration on production database (BACKUP FIRST!)
- [ ] Update `NEXT_PUBLIC_API_URL` to production URL
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database credentials
- [ ] Set up S3 for image storage (replace local uploads)
- [ ] Add Redis for caching
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (error logging, performance)
- [ ] Configure SSL certificates
- [ ] Test all features on production

---

## Useful Commands

### Database
```bash
# Connect to database
psql -U your_user -d olx_database

# List all tables
\dt

# Describe table structure
\d advertisements

# Count ads
SELECT COUNT(*) FROM advertisements WHERE is_active = true;

# Count categories
SELECT COUNT(*) FROM categories;

# View Texas cities
SELECT * FROM texas_cities ORDER BY population DESC;
```

### Backend
```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Run tests (if configured)
npm test

# Populate database with sample data
npm run populate
```

### Frontend
```bash
# Development server with Turbopack (faster)
npm run dev

# Development server (stable)
npm run dev:stable

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## File Structure Overview

```
olx/
├── olx-backend/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── validation.js         # Input validation
│   ├── migrations/
│   │   └── 001-add-location...   # Database migrations
│   ├── models/
│   │   ├── Advertisement.js      # Ad model
│   │   └── User.js               # User model
│   ├── routes/
│   │   ├── ads.js                # ⭐ Main API routes
│   │   ├── auth.js               # Login/signup
│   │   └── users.js              # User management
│   ├── scripts/
│   │   └── run-migration.js      # Migration runner
│   ├── uploads/                  # Image storage
│   ├── config.env                # Environment config
│   └── server.js                 # Express server
│
├── olx-website/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── search/
│   │   │   │   └── page.tsx      # ⭐ Search page
│   │   │   └── post-ad/
│   │   │       └── page.tsx      # Post ad form
│   │   ├── components/
│   │   │   ├── Header.tsx        # Navigation
│   │   │   └── ui/               # UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Auth state
│   │   ├── lib/
│   │   │   ├── constants.ts      # ⭐ Config (currency, cities, categories)
│   │   │   └── api.ts            # API client
│   │   └── styles/
│   ├── public/
│   ├── .env.local                # Environment config
│   └── next.config.ts
│
└── TEXAS-LAUNCH-SUMMARY.md       # ⭐ Complete documentation
```

**⭐ = Key files to understand**

---

## Next Steps

After successful setup:

1. **Populate with sample data** (optional):
   - Use post ad form to create listings
   - Or run: `npm run populate` (if script exists)

2. **Customize branding**:
   - Update logo in `public/`
   - Edit colors in `tailwind.config.ts`
   - Modify text in homepage

3. **Add monetization features**:
   - Integrate Stripe for payments
   - Add premium listing options
   - Implement seller subscriptions

4. **Launch marketing**:
   - SEO optimization
   - Google Ads (Texas targeting)
   - Social media campaigns

---

## Getting Help

1. **Check documentation**: `TEXAS-LAUNCH-SUMMARY.md`
2. **Review code comments**: Most files have inline docs
3. **Check console logs**: Backend and frontend log helpful info
4. **Database issues**: See `migrations/README.md`

---

## Success! 🎉

If you see:
- ✅ Homepage with Texas branding
- ✅ 12 categories
- ✅ $ prices (not ₹)
- ✅ Texas cities in dropdowns
- ✅ Working search and filters

**You're ready to launch!** 🚀

---

**Questions? Issues?** Review the full documentation in `TEXAS-LAUNCH-SUMMARY.md`

**Version**: 1.0.0 (Texas Market Launch)
**Last Updated**: January 2025
