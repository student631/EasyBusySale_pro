const pool = require('../config/database');

class Message {
  static async createTable() {
    try {
      // Create conversations table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
          buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(ad_id, buyer_id, seller_id)
        )
      `);

      // Create messages table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          message_text TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_ad_id ON conversations(ad_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
      `);

      // Create trigger function
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_conversation_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE conversations
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.conversation_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Create trigger
      await pool.query(`
        DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
        CREATE TRIGGER trigger_update_conversation_timestamp
          AFTER INSERT ON messages
          FOR EACH ROW
          EXECUTE FUNCTION update_conversation_timestamp();
      `);

      console.log('Messages and conversations tables created successfully');
    } catch (error) {
      console.error('Error creating messages tables:', error);
      throw error;
    }
  }

  static async create(conversationId, senderId, receiverId, messageText) {
    try {
      const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [conversationId, senderId, receiverId, messageText]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getByConversationId(conversationId) {
    try {
      const result = await pool.query(
        `SELECT m.*,
                sender.username as sender_name,
                receiver.username as receiver_name
         FROM messages m
         LEFT JOIN users sender ON m.sender_id = sender.id
         LEFT JOIN users receiver ON m.receiver_id = receiver.id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC`,
        [conversationId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  static async markAsRead(conversationId, userId) {
    try {
      await pool.query(
        `UPDATE messages
         SET is_read = true
         WHERE conversation_id = $1 AND receiver_id = $2`,
        [conversationId, userId]
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

module.exports = Message;