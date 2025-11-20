const pool = require('./config/database');
const Message = require('./models/Message');

async function setupMessagesTables() {
  try {
    console.log('🔧 Setting up messages and conversations tables...');

    await Message.createTable();

    console.log('✅ Tables created successfully!');
    console.log('\nVerifying tables...');

    // Verify conversations table
    const convResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'conversations'
    `);

    if (convResult.rows.length > 0) {
      console.log('✅ conversations table exists');
    } else {
      console.log('❌ conversations table NOT found');
    }

    // Verify messages table
    const msgResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'messages'
    `);

    if (msgResult.rows.length > 0) {
      console.log('✅ messages table exists');
    } else {
      console.log('❌ messages table NOT found');
    }

    // Show table structure
    console.log('\n📋 Conversations table structure:');
    const convStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `);
    console.table(convStructure.rows);

    console.log('\n📋 Messages table structure:');
    const msgStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `);
    console.table(msgStructure.rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    process.exit(1);
  }
}

setupMessagesTables();
