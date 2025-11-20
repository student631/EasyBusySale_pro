const pool = require('../config/database');

class Conversation {
  static async create(adId, buyerId, sellerId) {
    try {
      const result = await pool.query(
        `INSERT INTO conversations (ad_id, buyer_id, seller_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (ad_id, buyer_id, seller_id)
         DO UPDATE SET updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [adId, buyerId, sellerId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const result = await pool.query(`
        SELECT
          c.id,
          c.ad_id,
          c.buyer_id,
          c.seller_id,
          c.created_at,
          c.updated_at,
          a.title as ad_title,
          a.price as ad_price,
          a.images as ad_images,
          buyer.username as buyer_name,
          seller.username as seller_name,
          last_msg.message_text as last_message,
          last_msg.created_at as last_message_time,
          last_msg.sender_id as last_sender_id,
          COALESCE(unread.unread_count, 0) as unread_count
        FROM conversations c
        LEFT JOIN advertisements a ON c.ad_id = a.id
        LEFT JOIN users buyer ON c.buyer_id = buyer.id
        LEFT JOIN users seller ON c.seller_id = seller.id
        LEFT JOIN LATERAL (
          SELECT message_text, created_at, sender_id
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) last_msg ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as unread_count
          FROM messages m
          WHERE m.conversation_id = c.id
          AND m.receiver_id = $1
          AND m.is_read = false
        ) unread ON true
        WHERE c.buyer_id = $1 OR c.seller_id = $1
        ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC
      `, [userId]);

      return result.rows.map(conv => ({
        ...conv,
        ad_images: typeof conv.ad_images === 'string' ? JSON.parse(conv.ad_images) : conv.ad_images
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async getById(conversationId, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
        [conversationId, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  static async updateTimestamp(conversationId) {
    try {
      await pool.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [conversationId]
      );
    } catch (error) {
      console.error('Error updating conversation timestamp:', error);
      throw error;
    }
  }
}

module.exports = Conversation;