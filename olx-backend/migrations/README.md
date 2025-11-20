# Database Migrations

This folder contains SQL migration files for the EasyBuySale database.

## Running Migrations

### Method 1: Using the Migration Runner Script (Recommended)
```bash
cd olx-backend
node scripts/run-migration.js
```

This will automatically run the latest migration with color-coded output and error handling.

### Method 2: Using psql Command Line
```bash
psql -U your_username -d olx_database -f migrations/001-add-location-and-category-fields.sql
```

### Method 3: Using a PostgreSQL GUI Tool
1. Open your preferred tool (pgAdmin, DBeaver, etc.)
2. Connect to your `olx_database`
3. Open the migration file
4. Execute the SQL

## Migration Files

### 001-add-location-and-category-fields.sql
**Purpose**: Texas Market Launch - Add location structure and categories

**Changes**:
- Adds `city`, `state`, `state_code`, `zip_code`, `latitude`, `longitude` columns to `advertisements` table
- Adds `currency` column (default: USD)
- Creates `categories` table with 12 pre-seeded categories
- Creates `texas_cities` table with 15 major Texas cities
- Creates indexes for improved query performance
- Adds triggers for `updated_at` timestamp automation

**Safe to Run**:
- ✅ Uses `IF NOT EXISTS` checks
- ✅ Non-destructive (only adds columns, doesn't remove)
- ✅ Backward compatible (old location field preserved)
- ✅ Includes verification queries at the end

**Rollback** (if needed):
```sql
-- Remove new columns
ALTER TABLE advertisements
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS state_code,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude,
DROP COLUMN IF EXISTS currency;

-- Drop new tables
DROP TABLE IF EXISTS texas_cities;
DROP TABLE IF EXISTS categories;

-- Drop indexes
DROP INDEX IF EXISTS idx_ads_city;
DROP INDEX IF EXISTS idx_ads_state;
DROP INDEX IF EXISTS idx_ads_location_active;
DROP INDEX IF EXISTS idx_ads_price_range;
DROP INDEX IF EXISTS idx_ads_condition;
```

## Verifying Migration Success

After running a migration, check:

1. **Column additions**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'advertisements'
AND column_name IN ('city', 'state', 'state_code', 'zip_code', 'latitude', 'longitude', 'currency');
```

2. **Categories count**:
```sql
SELECT COUNT(*) FROM categories WHERE is_active = true;
-- Expected: 12
```

3. **Texas cities count**:
```sql
SELECT COUNT(*) FROM texas_cities;
-- Expected: 15
```

4. **Sample category data**:
```sql
SELECT name, slug, icon, color FROM categories ORDER BY display_order LIMIT 5;
```

## Best Practices

1. **Always backup** your database before running migrations
2. **Test on development** database first
3. **Review the SQL** before executing
4. **Run during low-traffic** periods if in production
5. **Monitor logs** for errors after migration

## Troubleshooting

### Error: "relation already exists"
**Solution**: The migration has already been run. Safe to ignore or re-run (uses IF NOT EXISTS).

### Error: "permission denied"
**Solution**: Ensure your database user has CREATE TABLE and ALTER TABLE permissions.

### Error: "syntax error"
**Solution**: Check PostgreSQL version compatibility. Migrations are tested on PostgreSQL 12+.

## Creating New Migrations

When creating a new migration:

1. Use sequential numbering: `002-your-migration-name.sql`
2. Include comments explaining the purpose
3. Use `IF NOT EXISTS` for safety
4. Include rollback instructions
5. Add verification queries at the end
6. Test thoroughly before committing

## Migration Naming Convention

```
XXX-descriptive-name.sql

XXX = Three-digit sequence number (001, 002, 003, etc.)
descriptive-name = Lowercase, hyphen-separated description
```

Examples:
- `001-add-location-and-category-fields.sql`
- `002-add-user-verification-fields.sql`
- `003-create-payment-transactions-table.sql`
