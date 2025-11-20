const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Starting slug migration...');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', '002-add-slug-to-advertisements.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Slug migration completed successfully!');

    // Verify the migration
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_ads,
        COUNT(slug) as ads_with_slug
      FROM advertisements
    `);

    console.log(`📊 Migration Stats:`, result.rows[0]);

    // Show sample slugs
    const samples = await pool.query(`
      SELECT id, title, slug
      FROM advertisements
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n📝 Sample Slugs:');
    samples.rows.forEach(ad => {
      console.log(`  - ${ad.title}`);
      console.log(`    Slug: ${ad.slug}`);
      console.log(`    URL: /ad/${ad.slug}\n`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
