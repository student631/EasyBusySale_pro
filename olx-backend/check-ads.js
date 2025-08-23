const Advertisement = require('./models/Advertisement');

async function checkAllAds() {
  try {
    console.log('🔍 Checking all advertisements in database...\n');
    
    const ads = await Advertisement.findAll(50, 0); // Get first 50 ads
    
    if (ads.length === 0) {
      console.log('❌ No advertisements found in database.');
      return;
    }
    
    console.log(`✅ Found ${ads.length} advertisement(s):\n`);
    
    ads.forEach((ad, index) => {
      console.log(`📋 Advertisement #${index + 1}:`);
      console.log(`   ID: ${ad.id}`);
      console.log(`   Title: ${ad.title}`);
      console.log(`   Price: ₹${ad.price}`);
      console.log(`   Category: ${ad.category}`);
      console.log(`   Location: ${ad.location}`);
      console.log(`   Description: ${ad.description}`);
      console.log(`   Condition: ${ad.condition_type}`);
      console.log(`   Seller: ${ad.seller_name || 'Unknown'}`);
      console.log(`   Created: ${ad.created_at}`);
      console.log(`   Views: ${ad.views_count}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error checking ads:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkAllAds()
    .then(() => {
      console.log('\n✅ Database check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to check ads:', error);
      process.exit(1);
    });
}

module.exports = checkAllAds;
