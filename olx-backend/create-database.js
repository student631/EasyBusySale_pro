const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default database first
    password: '123',
    port: 5432,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'olx_database'"
    );
    
    if (checkDb.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE olx_database');
      console.log('✅ Database "olx_database" created successfully!');
    } else {
      console.log('✅ Database "olx_database" already exists!');
    }
    
    await client.release();
    await pool.end();
    
    console.log('\n🎉 Database setup completed!');
    console.log('📝 You can now run your backend server.');
    
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    await pool.end();
  }
}

createDatabase();
