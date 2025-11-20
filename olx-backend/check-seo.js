const pool = require('./config/database');

async function checkSeoMetadata() {
  try {
    console.log('\n🔍 Checking Latest Ads for SEO Metadata...\n');

    const result = await pool.query(`
      SELECT
        id,
        title,
        seo_title,
        seo_description,
        seo_keywords,
        created_at
      FROM advertisements
      ORDER BY id DESC
      LIMIT 5
    `);

    if (result.rows.length === 0) {
      console.log('❌ No ads found in database');
      process.exit(0);
    }

    result.rows.forEach((ad, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Ad #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 ID: ${ad.id}`);
      console.log(`📝 Title: ${ad.title}`);
      console.log(`📅 Created: ${ad.created_at}`);
      console.log('\n🎯 SEO Metadata:');

      if (ad.seo_title) {
        console.log(`✅ SEO Title: ${ad.seo_title}`);
      } else {
        console.log(`❌ SEO Title: NOT GENERATED`);
      }

      if (ad.seo_description) {
        console.log(`✅ SEO Description: ${ad.seo_description.substring(0, 100)}...`);
      } else {
        console.log(`❌ SEO Description: NOT GENERATED`);
      }

      if (ad.seo_keywords && ad.seo_keywords.length > 0) {
        console.log(`✅ SEO Keywords (${ad.seo_keywords.length}): ${ad.seo_keywords.join(', ')}`);
      } else {
        console.log(`❌ SEO Keywords: NOT GENERATED`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Count ads with and without SEO
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(seo_title) as with_seo_title,
        COUNT(seo_description) as with_seo_description,
        COUNT(seo_keywords) as with_seo_keywords
      FROM advertisements
    `);

    const stats = statsResult.rows[0];
    console.log('📊 SEO Statistics:');
    console.log(`   Total Ads: ${stats.total}`);
    console.log(`   With SEO Title: ${stats.with_seo_title} (${Math.round(stats.with_seo_title/stats.total*100)}%)`);
    console.log(`   With SEO Description: ${stats.with_seo_description} (${Math.round(stats.with_seo_description/stats.total*100)}%)`);
    console.log(`   With SEO Keywords: ${stats.with_seo_keywords} (${Math.round(stats.with_seo_keywords/stats.total*100)}%)`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSeoMetadata();
