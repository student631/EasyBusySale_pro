const express = require('express');
const router = express.Router();
const aiClassification = require('../services/aiClassification');

// POST classify ad content
router.post('/classify', async (req, res) => {
  try {
    const { title, description, price = 0 } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        error: 'Title or description is required for classification'
      });
    }

    const classification = aiClassification.classifyAd(title, description, parseFloat(price) || 0);

    res.json({
      success: true,
      data: classification
    });
  } catch (error) {
    console.error('Error classifying ad:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify advertisement'
    });
  }
});

// POST batch classify multiple ads
router.post('/classify/batch', async (req, res) => {
  try {
    const { ads } = req.body;

    if (!Array.isArray(ads) || ads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ads array is required and cannot be empty'
      });
    }

    if (ads.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 ads can be classified in a single batch'
      });
    }

    const classifications = aiClassification.batchClassify(ads);

    res.json({
      success: true,
      data: classifications,
      total: classifications.length
    });
  } catch (error) {
    console.error('Error batch classifying ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch classify advertisements'
    });
  }
});

// GET category keywords for autocomplete
router.get('/keywords/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const keywords = aiClassification.getCategoryKeywords(category);

    if (keywords.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: category,
        keywords: keywords
      }
    });
  } catch (error) {
    console.error('Error getting keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get category keywords'
    });
  }
});

// GET all available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = aiClassification.getAvailableCategories();

    res.json({
      success: true,
      data: {
        categories: categories,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available categories'
    });
  }
});

// POST smart categorize - auto-suggest category while typing
router.post('/suggest-category', async (req, res) => {
  try {
    const { title = '', description = '', price = 0 } = req.body;

    if (!title.trim() && !description.trim()) {
      return res.json({
        success: true,
        data: {
          category: 'general',
          confidence: 0.1,
          suggestions: ['Add more details for better category detection']
        }
      });
    }

    const classification = aiClassification.classifyAd(title, description, parseFloat(price) || 0);

    res.json({
      success: true,
      data: {
        category: classification.category,
        confidence: classification.confidence,
        suggestions: classification.suggestions,
        alternativeCategories: Object.entries(classification.scores)
          .sort(([,a], [,b]) => b - a)
          .slice(1, 4) // Top 3 alternatives
          .map(([cat, score]) => ({ category: cat, score }))
      }
    });
  } catch (error) {
    console.error('Error suggesting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest category'
    });
  }
});

// POST price validation
router.post('/validate-price', async (req, res) => {
  try {
    const { category, title = '', description = '', price } = req.body;

    if (!category || !price) {
      return res.status(400).json({
        success: false,
        error: 'Category and price are required'
      });
    }

    const classification = aiClassification.classifyAd(title, description, parseFloat(price));
    const priceEstimate = classification.metadata.estimatedValue;

    res.json({
      success: true,
      data: {
        isValidPrice: true,
        priceAssessment: priceEstimate.assessment,
        suggestedRange: priceEstimate.range,
        confidence: classification.confidence,
        flags: classification.flags
      }
    });
  } catch (error) {
    console.error('Error validating price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate price'
    });
  }
});

// POST content quality check
router.post('/quality-check', async (req, res) => {
  try {
    const { title, description, price = 0, images = [] } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        error: 'Title or description is required'
      });
    }

    const classification = aiClassification.classifyAd(title, description, parseFloat(price) || 0);

    // Quality scoring
    let qualityScore = 0;
    const qualityFactors = [];

    // Title quality
    if (title && title.length >= 10) {
      qualityScore += 20;
      qualityFactors.push({ factor: 'Good title length', points: 20 });
    } else {
      qualityFactors.push({ factor: 'Title too short', points: -10 });
    }

    // Description quality
    if (description && description.length >= 50) {
      qualityScore += 25;
      qualityFactors.push({ factor: 'Detailed description', points: 25 });
    } else {
      qualityFactors.push({ factor: 'Description needs more detail', points: -15 });
    }

    // Price presence
    if (price > 0) {
      qualityScore += 15;
      qualityFactors.push({ factor: 'Price included', points: 15 });
    }

    // Images
    if (images.length > 0) {
      qualityScore += 20;
      qualityFactors.push({ factor: `${images.length} image(s) provided`, points: 20 });
    } else {
      qualityFactors.push({ factor: 'No images provided', points: -20 });
    }

    // Category confidence
    if (classification.confidence > 0.7) {
      qualityScore += 10;
      qualityFactors.push({ factor: 'Clear category match', points: 10 });
    }

    // Flags penalty
    if (classification.flags.length > 0) {
      const penalty = classification.flags.length * 5;
      qualityScore -= penalty;
      qualityFactors.push({ factor: `${classification.flags.length} issue(s) detected`, points: -penalty });
    }

    qualityScore = Math.max(0, Math.min(100, qualityScore));

    let qualityRating = 'Poor';
    if (qualityScore >= 80) qualityRating = 'Excellent';
    else if (qualityScore >= 60) qualityRating = 'Good';
    else if (qualityScore >= 40) qualityRating = 'Fair';

    res.json({
      success: true,
      data: {
        qualityScore: qualityScore,
        qualityRating: qualityRating,
        qualityFactors: qualityFactors,
        suggestions: classification.suggestions,
        flags: classification.flags,
        estimatedViews: Math.floor(qualityScore * 0.5), // Rough estimate
        category: classification.category
      }
    });
  } catch (error) {
    console.error('Error checking quality:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check content quality'
    });
  }
});

module.exports = router;