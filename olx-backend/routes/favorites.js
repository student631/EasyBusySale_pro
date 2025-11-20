const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// GET user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const pool = require('../config/database');

    const result = await pool.query(`
      SELECT
        a.id,
        a.title,
        a.price,
        a.category,
        a.location,
        a.images,
        a.is_active,
        f.created_at as saved_at
      FROM favorites f
      JOIN advertisements a ON f.ad_id = a.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    // Parse images if stored as JSON string
    const favorites = result.rows.map(fav => ({
      ...fav,
      images: typeof fav.images === 'string' ? JSON.parse(fav.images) : fav.images
    }));

    res.json({
      success: true,
      favorites: favorites,
      total: favorites.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

// POST add to favorites
router.post('/:adId', authenticateToken, async (req, res) => {
  try {
    const { adId } = req.params;
    const pool = require('../config/database');

    // Check if ad exists
    const adResult = await pool.query(
      'SELECT id FROM advertisements WHERE id = $1 AND is_active = true',
      [adId]
    );

    if (adResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found or inactive'
      });
    }

    // Check if already favorited
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND ad_id = $2',
      [req.user.id, adId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Advertisement already in favorites'
      });
    }

    // Add to favorites
    await pool.query(
      'INSERT INTO favorites (user_id, ad_id) VALUES ($1, $2)',
      [req.user.id, adId]
    );

    res.status(201).json({
      success: true,
      message: 'Added to favorites successfully'
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to favorites'
    });
  }
});

// DELETE remove from favorites
router.delete('/:adId', authenticateToken, async (req, res) => {
  try {
    const { adId } = req.params;
    const pool = require('../config/database');

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND ad_id = $2 RETURNING id',
      [req.user.id, adId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites'
    });
  }
});

// GET check if ad is favorited
router.get('/check/:adId', authenticateToken, async (req, res) => {
  try {
    const { adId } = req.params;
    const pool = require('../config/database');

    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND ad_id = $2',
      [req.user.id, adId]
    );

    res.json({
      success: true,
      isFavorite: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check favorite status'
    });
  }
});

module.exports = router;