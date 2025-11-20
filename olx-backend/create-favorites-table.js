const pool = require('./config/database');

async function createFavoritesTable() {
  try {
    console.log('Creating favorites table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          ad_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (ad_id) REFERENCES advertisements(id) ON DELETE CASCADE,
          UNIQUE(user_id, ad_id)
      );
    `);

    console.log('Creating indexes...');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_ad_id ON favorites(ad_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);`);

    console.log('✅ Favorites table and indexes created successfully!');

  } catch (error) {
    console.error('❌ Error setting up favorites:', error);
    throw error;
  }
}

createFavoritesTable();