const { Pool } = require('pg');
require('dotenv').config();

// Test different passwords
const passwords = ['postgres', 'admin', 'password', '123456', '123', ''];

async function testConnection(password) {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Use default database first
    password: password,
    port: 5432,
  });

  try {
    const client = await pool.connect();
    console.log(`✅ SUCCESS with password: "${password}"`);
    await client.query('SELECT version()');
    await client.release();
    await pool.end();
    return password;
  } catch (error) {
    console.log(`❌ FAILED with password: "${password}" - ${error.message}`);
    await pool.end();
    return null;
  }
}

async function findCorrectPassword() {
  console.log('🔍 Testing PostgreSQL passwords...\n');
  
  for (const password of passwords) {
    const result = await testConnection(password);
    if (result) {
      console.log(`\n🎉 Found working password: "${result}"`);
      return result;
    }
  }
  
  console.log('\n❌ No working password found. You may need to:');
  console.log('1. Open pgAdmin and check your password');
  console.log('2. Reset PostgreSQL password');
  console.log('3. Check if PostgreSQL is running');
  return null;
}

// Run the test
findCorrectPassword().then(correctPassword => {
  if (correctPassword) {
    console.log(`\n📝 Update your config.env with: DB_PASSWORD=${correctPassword}`);
  }
  process.exit(0);
});
