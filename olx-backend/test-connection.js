const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('✅ Database query successful!');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    await client.release();
    await pool.end();
    
    console.log('\n🎉 Database connection test passed!');
    console.log('📝 Your config.env is working correctly.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    await pool.end();
  }
}

testConnection();
