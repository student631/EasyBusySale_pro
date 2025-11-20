const pool = require('../config/database');

/**
 * Migration: Add SEO fields to advertisements table
 * This adds seo_title, seo_description, and seo_keywords columns
 */
async function addSeoFields() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting migration: Add SEO fields to advertisements table...');

    await client.query('BEGIN');

    // Check if columns already exist
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'advertisements'
      AND column_name IN ('seo_title', 'seo_description', 'seo_keywords');
    `;

    const existingColumns = await client.query(checkQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);

    // Add seo_title if it doesn't exist
    if (!existingColumnNames.includes('seo_title')) {
      console.log('  → Adding seo_title column...');
      await client.query(`
        ALTER TABLE advertisements
        ADD COLUMN seo_title VARCHAR(200);
      `);
      console.log('  ✓ seo_title column added');
    } else {
      console.log('  ✓ seo_title column already exists');
    }

    // Add seo_description if it doesn't exist
    if (!existingColumnNames.includes('seo_description')) {
      console.log('  → Adding seo_description column...');
      await client.query(`
        ALTER TABLE advertisements
        ADD COLUMN seo_description TEXT;
      `);
      console.log('  ✓ seo_description column added');
    } else {
      console.log('  ✓ seo_description column already exists');
    }

    // Add seo_keywords if it doesn't exist
    if (!existingColumnNames.includes('seo_keywords')) {
      console.log('  → Adding seo_keywords column...');
      await client.query(`
        ALTER TABLE advertisements
        ADD COLUMN seo_keywords TEXT[];
      `);
      console.log('  ✓ seo_keywords column added');
    } else {
      console.log('  ✓ seo_keywords column already exists');
    }

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');

    // Generate SEO data for existing ads
    console.log('\n🔄 Generating SEO data for existing advertisements...');
    const { generateSeoTitle, generateSeoDescription, generateSeoKeywords } = require('../utils/seoHelper');

    const adsResult = await client.query(`
      SELECT id, title, description, price, category, condition_type, location
      FROM advertisements
      WHERE seo_title IS NULL OR seo_description IS NULL OR seo_keywords IS NULL;
    `);

    console.log(`  Found ${adsResult.rows.length} ads without SEO data`);

    for (const ad of adsResult.rows) {
      const seoTitle = generateSeoTitle(ad.title, ad.category, ad.condition_type, ad.location);
      const seoDescription = generateSeoDescription(ad.description, ad.price, ad.condition_type, ad.location);
      const seoKeywords = generateSeoKeywords(ad.title, ad.category, ad.condition_type, ad.location, ad.description);

      await client.query(`
        UPDATE advertisements
        SET seo_title = $1, seo_description = $2, seo_keywords = $3
        WHERE id = $4;
      `, [seoTitle, seoDescription, seoKeywords, ad.id]);

      console.log(`  ✓ Generated SEO data for ad #${ad.id}: "${ad.title}"`);
    }

    console.log('✅ SEO data generation completed!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if executed directly
if (require.main === module) {
  addSeoFields()
    .then(() => {
      console.log('\n✅ All done! Exiting...');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addSeoFields };
