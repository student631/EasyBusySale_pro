const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const { authenticateToken, authorizeResourceOwner } = require('../middleware/auth');
const validation = require('../middleware/validation');

// GET all ads with optional search and advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      q,
      category,
      limit = 20,
      offset = 0,
      search,
      minPrice,
      maxPrice,
      condition,
      location,
      sortBy = 'date_desc'
    } = req.query;

    // Handle both 'q' and 'search' parameters for flexibility
    const searchQuery = q || search;

    console.log('📊 Search params:', {
      searchQuery,
      category,
      minPrice,
      maxPrice,
      condition,
      location,
      sortBy,
      limit,
      offset
    });

    // Build WHERE clause conditions
    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Always filter active ads
    conditions.push('a.is_active = true');

    // Search query (title or description)
    if (searchQuery) {
      paramCount++;
      conditions.push(`(a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`);
      params.push(`%${searchQuery}%`);
    }

    // Category filter
    if (category) {
      paramCount++;
      conditions.push(`a.category = $${paramCount}`);
      params.push(category);
    }

    // Price range filter
    if (minPrice) {
      paramCount++;
      conditions.push(`a.price >= $${paramCount}`);
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      conditions.push(`a.price <= $${paramCount}`);
      params.push(parseFloat(maxPrice));
    }

    // Condition filter
    if (condition) {
      paramCount++;
      conditions.push(`a.condition_type = $${paramCount}`);
      params.push(condition);
    }

    // Location filter (supports both old 'location' field and new 'city' field)
    if (location) {
      paramCount++;
      conditions.push(`(a.location ILIKE $${paramCount} OR a.city ILIKE $${paramCount})`);
      params.push(`%${location}%`);
    }

    // Build ORDER BY clause
    let orderBy = 'a.created_at DESC'; // default
    switch (sortBy) {
      case 'price_asc':
        orderBy = 'a.price ASC';
        break;
      case 'price_desc':
        orderBy = 'a.price DESC';
        break;
      case 'date_asc':
        orderBy = 'a.created_at ASC';
        break;
      case 'date_desc':
        orderBy = 'a.created_at DESC';
        break;
      case 'views':
        orderBy = 'a.views_count DESC';
        break;
      default:
        orderBy = 'a.created_at DESC';
    }

    // Build final query
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const query = `
      SELECT
        a.*,
        u.username as seller_name,
        u.location as seller_location
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(parseInt(limit), parseInt(offset));

    console.log('📝 Final query:', query);
    console.log('📦 Params:', params);

    const pool = require('../config/database');
    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM advertisements a
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, paramCount));
    const total = parseInt(countResult.rows[0].total);

    console.log(`✅ Found ${result.rows.length} ads (total: ${total})`);

    res.json({
      success: true,
      data: {
        ads: result.rows,
        total: total,
        returned: result.rows.length,
        query: searchQuery,
        filters: {
          category,
          minPrice,
          maxPrice,
          condition,
          location,
          sortBy
        },
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + result.rows.length < total
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertisements',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST new ad (authentication required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
      images = [],
      condition_type = 'used',
      contact_phone,
      contact_email
    } = req.body;

    // Enhanced validation using middleware
    if (!validation.validateTitle(title)) {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be at least 3 characters long'
      });
    }

    if (!validation.validateDescription(description)) {
      return res.status(400).json({
        success: false,
        error: 'Description is required and must be at least 10 characters long'
      });
    }

    if (!validation.validatePrice(price)) {
      return res.status(400).json({
        success: false,
        error: 'Price is required and must be a positive number'
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    if (!validation.validateLocation(location)) {
      return res.status(400).json({
        success: false,
        error: 'Location is required and must be at least 2 characters long'
      });
    }

    // Validate condition type
    if (!validation.validateCondition(condition_type)) {
      const validConditions = ['new', 'like-new', 'good', 'fair', 'poor', 'used'];
      return res.status(400).json({
        success: false,
        error: 'Invalid condition type. Must be one of: ' + validConditions.join(', ')
      });
    }

    // Validate images array
    if (!validation.validateImages(images)) {
      return res.status(400).json({
        success: false,
        error: 'Images must be an array with maximum 5 images'
      });
    }

    // Validate contact information
    if (!validation.validatePhone(contact_phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    if (contact_email && !validation.validateEmail(contact_email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const adData = {
      user_id: req.user.id, // Now guaranteed to exist due to authenticateToken
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      location: location.trim(),
      images,
      condition_type,
      contact_phone: contact_phone ? contact_phone.trim() : null,
      contact_email: contact_email ? contact_email.trim() : null
    };

    const newAd = await Advertisement.create(adData);

    console.log(`✅ Advertisement created successfully: ${newAd.title} (ID: ${newAd.id}, Slug: ${newAd.slug})`);

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: newAd
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Database constraint violation'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create advertisement'
    });
  }
});

// PUT update ad (requires authentication and ownership)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // First check if ad exists and user owns it
    const existingAd = await Advertisement.findById(req.params.id);
    
    if (!existingAd) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    if (existingAd.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this advertisement'
      });
    }

    const {
      title,
      description,
      price,
      category,
      location,
      images,
      condition_type,
      contact_phone,
      contact_email
    } = req.body;

    // Enhanced validation for update using middleware
    if (title !== undefined && !validation.validateTitle(title)) {
      return res.status(400).json({
        success: false,
        error: 'Title must be at least 3 characters long'
      });
    }

    if (description !== undefined && !validation.validateDescription(description)) {
      return res.status(400).json({
        success: false,
        error: 'Description must be at least 10 characters long'
      });
    }

    if (price !== undefined && !validation.validatePrice(price)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number'
      });
    }

    if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    if (location !== undefined && !validation.validateLocation(location)) {
      return res.status(400).json({
        success: false,
        error: 'Location must be at least 2 characters long'
      });
    }

    // Validate condition type
    if (condition_type !== undefined && !validation.validateCondition(condition_type)) {
      const validConditions = ['new', 'like-new', 'good', 'fair', 'poor', 'used'];
      return res.status(400).json({
        success: false,
        error: 'Invalid condition type. Must be one of: ' + validConditions.join(', ')
      });
    }

    // Validate images array
    if (images !== undefined && !validation.validateImages(images)) {
      return res.status(400).json({
        success: false,
        error: 'Images must be an array with maximum 5 images'
      });
    }

    // Validate contact information
    if (contact_phone !== undefined && contact_phone !== null && contact_phone !== '' && !validation.validatePhone(contact_phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    if (contact_email !== undefined && contact_email !== null && contact_email !== '' && !validation.validateEmail(contact_email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const updateData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(category !== undefined && { category: category.trim() }),
      ...(location !== undefined && { location: location.trim() }),
      ...(images !== undefined && { images }),
      ...(condition_type !== undefined && { condition_type }),
      ...(contact_phone !== undefined && { contact_phone: contact_phone ? contact_phone.trim() : null }),
      ...(contact_email !== undefined && { contact_email: contact_email ? contact_email.trim() : null })
    };

    const updatedAd = await Advertisement.update(req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: updatedAd
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Database constraint violation'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update advertisement'
    });
  }
});

// DELETE ad (soft delete, requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // First check if ad exists and user owns it
    const existingAd = await Advertisement.findById(req.params.id);
    
    if (!existingAd) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    if (existingAd.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this advertisement'
      });
    }

    const deletedAd = await Advertisement.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete advertisement'
    });
  }
});

// Get user's ads (requires authentication)
router.get('/my-ads', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const ads = await Advertisement.findByUserId(req.user.id, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: ads
    });
  } catch (error) {
    console.error('Error fetching user ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user advertisements'
    });
  }
});

// Get user's ads by user ID (requires authentication and ownership)
router.get('/user/:userId/ads', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.params.userId;

    // Check if user is requesting their own ads
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You can only access your own ads'
      });
    }

    const ads = await Advertisement.findByUserId(userId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      ads: ads,
      total: ads.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching user ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user advertisements'
    });
  }
});

// GET featured ads
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const ads = await Advertisement.getFeatured(parseInt(limit));

    res.json({
      success: true,
      ads: ads,
      total: ads.length
    });
  } catch (error) {
    console.error('Error fetching featured ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured advertisements'
    });
  }
});

// GET ads by location
router.get('/location/:location', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const location = req.params.location;

    const ads = await Advertisement.getByLocation(location, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      ads: ads,
      location: location,
      total: ads.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching ads by location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertisements by location'
    });
  }
});

// GET categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Advertisement.getCategories();

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET similar ads
router.get('/:id/similar', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const adId = req.params.id;

    // First get the ad to get its category
    const ad = await Advertisement.findById(adId);
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    const similarAds = await Advertisement.getSimilar(adId, ad.category, parseInt(limit));

    res.json({
      success: true,
      ads: similarAds,
      total: similarAds.length
    });
  } catch (error) {
    console.error('Error fetching similar ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar advertisements'
    });
  }
});

// POST mark ad as sold
router.post('/:id/sold', authenticateToken, async (req, res) => {
  try {
    const adId = req.params.id;

    // First check if ad exists and user owns it
    const existingAd = await Advertisement.findById(adId);

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    if (existingAd.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to mark this advertisement as sold'
      });
    }

    const soldAd = await Advertisement.markAsSold(adId);

    res.json({
      success: true,
      message: 'Advertisement marked as sold successfully',
      data: soldAd
    });
  } catch (error) {
    console.error('Error marking ad as sold:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark advertisement as sold'
    });
  }
});

// Legacy search route for backward compatibility
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;

    const ads = await Advertisement.search(q, category, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      ads: ads,
      total: ads.length,
      query: q,
      category: category
    });
  } catch (error) {
    console.error('Error searching ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search advertisements'
    });
  }
});

// GET single ad by ID or slug (MUST BE LAST - after all specific routes)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log(`📖 Fetching ad details for: ${identifier}`);

    // Use the findByIdOrSlug method for flexible lookup
    const ad = await Advertisement.findByIdOrSlug(identifier);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Increment view count
    const pool = require('../config/database');
    await pool.query(
      'UPDATE advertisements SET views_count = views_count + 1 WHERE id = $1',
      [ad.id]
    );

    // Update the view count in the returned object
    ad.views_count = (ad.views_count || 0) + 1;

    // Parse images if stored as JSON string
    if (typeof ad.images === 'string') {
      try {
        ad.images = JSON.parse(ad.images);
      } catch (e) {
        ad.images = [];
      }
    }

    console.log(`✅ Ad details fetched successfully: ${ad.title} (ID: ${ad.id}, Slug: ${ad.slug})`);

    res.json({
      success: true,
      data: {
        ad: ad
      }
    });

  } catch (error) {
    console.error('❌ Error fetching ad details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

