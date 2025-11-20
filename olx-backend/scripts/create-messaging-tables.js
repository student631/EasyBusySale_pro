const pool = require('../config/database');

async function createMessagingTables() {
  try {
    console.log('Creating messaging system tables...');

    // Create conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER NOT NULL,
          buyer_id INTEGER NOT NULL,
          seller_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ad_id) REFERENCES advertisements(id) ON DELETE CASCADE,
          FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(ad_id, buyer_id, seller_id)
      );
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          message_text TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          related_id INTEGER,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('Creating indexes...');

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_ad_id ON conversations(ad_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);`);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);`);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);`);

    console.log('✅ Messaging system tables and indexes created successfully!');

  } catch (error) {
    console.error('❌ Error setting up messaging tables:', error);
    throw error;
  }
}

createMessagingTables();