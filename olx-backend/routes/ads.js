const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');

// GET all ads
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category } = req.query;
    
    let ads;
    if (category) {
      ads = await Advertisement.findByCategory(category, parseInt(limit), parseInt(offset));
    } else {
      ads = await Advertisement.findAll(parseInt(limit), parseInt(offset));
    }
    
    res.json({
      success: true,
      ads: ads,
      total: ads.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertisements'
    });
  }
});

// GET single ad by ID
router.get('/:id', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }
    
    // Increment view count
    await Advertisement.incrementViews(req.params.id);
    
    res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertisement'
    });
  }
});

// POST new ad
router.post('/', async (req, res) => {
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
      contact_email,
      user_id = 1 // Temporary user ID, will be replaced with actual user authentication
    } = req.body;

    // Validation
    if (!title || !price || !category || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, price, category, location'
      });
    }

    const adData = {
      user_id,
      title,
      description,
      price: parseFloat(price),
      category,
      location,
      images,
      condition_type,
      contact_phone,
      contact_email
    };

    const newAd = await Advertisement.create(adData);
    
    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: newAd
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create advertisement'
    });
  }
});

// PUT update ad
router.put('/:id', async (req, res) => {
  try {
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

    const updateData = {
      title,
      description,
      price: parseFloat(price),
      category,
      location,
      images,
      condition_type,
      contact_phone,
      contact_email
    };

    const updatedAd = await Advertisement.update(req.params.id, updateData);
    
    if (!updatedAd) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: updatedAd
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update advertisement'
    });
  }
});

// DELETE ad (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const deletedAd = await Advertisement.delete(req.params.id);
    
    if (!deletedAd) {
      return res.status(404).json({
        success: false,
        error: 'Advertisement not found'
      });
    }

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

// Search ads
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

module.exports = router;

