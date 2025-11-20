const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Add logging middleware for all message routes
router.use((req, res, next) => {
  console.log(`\n🔵 Messages Route: ${req.method} ${req.path}`);
  console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('👤 User:', req.user ? `ID: ${req.user.id}` : 'Not authenticated yet');
  next();
});

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

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

    const conversations = result.rows.map(conv => ({
      ...conv,
      ad_images: typeof conv.ad_images === 'string' ? JSON.parse(conv.ad_images) : conv.ad_images
    }));

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // First check if user is part of this conversation
    const convCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [conversationId, userId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this conversation'
      });
    }

    // Get messages
    const result = await pool.query(`
      SELECT
        m.*,
        sender.username as sender_name,
        receiver.username as receiver_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read for the current user
    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND receiver_id = $2',
      [conversationId, userId]
    );

    res.json({
      success: true,
      messages: result.rows,
      conversation: convCheck.rows[0]
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    console.log('📨 Send Message Endpoint Hit');
    const { adId, receiverId, messageText, conversationId } = req.body;
    const senderId = req.user.id;

    console.log('📝 Parsed Data:', { adId, receiverId, messageText: messageText?.substring(0, 50), conversationId, senderId });

    if (!messageText || messageText.trim().length === 0) {
      console.log('❌ Validation Failed: Empty message text');
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }

    let finalConversationId = conversationId;

    // If no conversation ID provided, create or find conversation
    if (!finalConversationId && adId && receiverId) {
      // Get ad details to determine seller
      const adResult = await pool.query('SELECT user_id FROM advertisements WHERE id = $1', [adId]);
      if (adResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Advertisement not found'
        });
      }

      const sellerId = adResult.rows[0].user_id;
      const buyerId = senderId === sellerId ? receiverId : senderId;

      // Find or create conversation
      const convResult = await pool.query(`
        INSERT INTO conversations (ad_id, buyer_id, seller_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (ad_id, buyer_id, seller_id)
        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [adId, buyerId, sellerId]);

      finalConversationId = convResult.rows[0].id;
    }

    if (!finalConversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID or ad details required'
      });
    }

    // Insert message
    const messageResult = await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [finalConversationId, senderId, receiverId, messageText.trim()]);

    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [finalConversationId]
    );

    // Create notification for receiver
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES ($1, 'message', 'New Message', $2, $3)
    `, [receiverId, `You have a new message: "${messageText.substring(0, 50)}..."`, finalConversationId]);

    console.log('✅ Message sent successfully:', messageResult.rows[0].id);

    res.status(201).json({
      success: true,
      message: messageResult.rows[0],
      conversationId: finalConversationId
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start a new conversation about an ad
router.post('/start-conversation', authenticateToken, async (req, res) => {
  try {
    console.log('🆕 Start Conversation Endpoint Hit');
    const { adId, messageText } = req.body;
    const buyerId = req.user.id;

    console.log('📝 Parsed Data:', { adId, messageText: messageText?.substring(0, 50), buyerId });

    if (!adId || !messageText) {
      console.log('❌ Validation Failed: Missing adId or messageText');
      return res.status(400).json({
        success: false,
        error: 'Ad ID and message text are required'
      });
    }

    // Get ad details
    const adResult = await pool.query(
      'SELECT user_id, title FROM advertisements WHERE id = $1 AND is_active = true',
      [adId]
    );

    if (adResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found or inactive'
      });
    }

    const sellerId = adResult.rows[0].user_id;
    const adTitle = adResult.rows[0].title;

    if (sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot message your own ad'
      });
    }

    // Create or get conversation
    const convResult = await pool.query(`
      INSERT INTO conversations (ad_id, buyer_id, seller_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (ad_id, buyer_id, seller_id)
      DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [adId, buyerId, sellerId]);

    const conversationId = convResult.rows[0].id;

    // Send initial message
    const messageResult = await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [conversationId, buyerId, sellerId, messageText.trim()]);

    // Create notification for seller
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, related_id)
      VALUES ($1, 'message', 'New Message About Your Ad', $2, $3)
    `, [sellerId, `Someone is interested in "${adTitle}": "${messageText.substring(0, 50)}..."`, conversationId]);

    console.log('✅ Conversation started successfully:', conversationId);

    res.status(201).json({
      success: true,
      conversation: { id: conversationId, ad_id: adId },
      message: messageResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark messages as read
router.put('/mark-read/:conversationId', authenticateToken, async (req, res) => {
  try {
    console.log('✓ Mark Read Endpoint Hit');
    const { conversationId } = req.params;
    const userId = req.user.id;

    console.log('📝 Data:', { conversationId, userId });

    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND receiver_id = $2',
      [conversationId, userId]
    );

    console.log('✅ Messages marked as read');

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
});

// Catch-all for unmatched routes in messages
router.all('*', (req, res) => {
  console.log('⚠️  UNMATCHED MESSAGE ROUTE');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Message route not found',
    attempted: `${req.method} ${req.path}`
  });
});

module.exports = router;