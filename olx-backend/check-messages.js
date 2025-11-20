const pool = require('./config/database');

async function checkMessages() {
  try {
    console.log('🔍 Checking messages in database...\n');

    // Get all conversations
    const convResult = await pool.query(`
      SELECT c.*, a.title as ad_title,
             buyer.username as buyer_name,
             seller.username as seller_name
      FROM conversations c
      LEFT JOIN advertisements a ON c.ad_id = a.id
      LEFT JOIN users buyer ON c.buyer_id = buyer.id
      LEFT JOIN users seller ON c.seller_id = seller.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    console.log('📊 Recent Conversations:');
    console.table(convResult.rows.map(c => ({
      id: c.id,
      ad_title: c.ad_title,
      buyer: c.buyer_name,
      seller: c.seller_name,
      created_at: new Date(c.created_at).toLocaleString()
    })));

    // Get all messages
    const msgResult = await pool.query(`
      SELECT m.*,
             sender.username as sender_name,
             receiver.username as receiver_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);

    console.log('\n💬 Recent Messages:');
    console.table(msgResult.rows.map(m => ({
      id: m.id,
      conv_id: m.conversation_id,
      from: m.sender_name,
      to: m.receiver_name,
      message: m.message_text.substring(0, 30),
      is_read: m.is_read,
      time: new Date(m.created_at).toLocaleString()
    })));

    console.log(`\n✅ Total Conversations: ${convResult.rows.length}`);
    console.log(`✅ Total Messages: ${msgResult.rows.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMessages();
