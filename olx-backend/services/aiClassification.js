// AI Classification Service - No external dependencies needed

class AIClassificationService {
  constructor() {
    this.categories = {
      'vehicles': ['car', 'truck', 'motorcycle', 'bike', 'auto', 'vehicle', 'honda', 'toyota', 'ford', 'bmw', 'mercedes', 'audi', 'suv', 'sedan', 'coupe', 'convertible'],
      'electronics': ['phone', 'laptop', 'computer', 'tv', 'camera', 'gaming', 'iphone', 'samsung', 'apple', 'macbook', 'ipad', 'tablet', 'smart', 'wireless', 'bluetooth'],
      'real-estate': ['apartment', 'house', 'room', 'rent', 'bedroom', 'bathroom', 'furnished', 'downtown', 'condo', 'townhouse', 'basement', 'utilities', 'lease', 'property'],
      'furniture': ['sofa', 'chair', 'table', 'bed', 'dresser', 'couch', 'dining', 'sectional', 'mattress', 'desk', 'bookshelf', 'cabinet', 'ottoman', 'recliner'],
      'clothing': ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'coat', 'jeans', 'sweater', 'boots', 'sneakers', 'designer', 'brand', 'size', 'fashion'],
      'sports': ['bike', 'bicycle', 'hockey', 'golf', 'tennis', 'fitness', 'gym', 'equipment', 'exercise', 'skates', 'helmet', 'gear', 'sports'],
      'pets': ['dog', 'cat', 'puppy', 'kitten', 'pet', 'animal', 'breed', 'rescue', 'adoption', 'vaccinated', 'trained', 'friendly'],
      'jobs': ['job', 'position', 'work', 'employment', 'career', 'hiring', 'full-time', 'part-time', 'remote', 'salary', 'benefits', 'experience'],
      'services': ['cleaning', 'repair', 'maintenance', 'installation', 'tutoring', 'teaching', 'consulting', 'freelance', 'professional', 'licensed', 'insured'],
      'books': ['book', 'textbook', 'novel', 'educational', 'university', 'college', 'course', 'study', 'learning', 'reference', 'manual']
    };

    this.priceRanges = {
      'vehicles': { min: 1000, max: 200000 },
      'real-estate': { min: 500, max: 10000 }, // monthly rent
      'electronics': { min: 50, max: 5000 },
      'furniture': { min: 20, max: 3000 },
      'clothing': { min: 10, max: 1000 },
      'sports': { min: 25, max: 2000 },
      'pets': { min: 100, max: 3000 },
      'jobs': { min: 30000, max: 150000 }, // annual salary
      'services': { min: 25, max: 500 }, // per service
      'books': { min: 5, max: 300 }
    };
  }

  /**
   * Classify an advertisement based on title and description
   * @param {string} title - Ad title
   * @param {string} description - Ad description
   * @param {number} price - Ad price
   * @returns {Object} Classification results
   */
  classifyAd(title = '', description = '', price = 0) {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(/\s+/);

    // Calculate category scores
    const categoryScores = {};

    Object.keys(this.categories).forEach(category => {
      let score = 0;
      const keywords = this.categories[category];

      keywords.forEach(keyword => {
        // Count occurrences of keyword
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex) || [];
        score += matches.length;

        // Bonus for exact title match
        if (title.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });

      // Price-based scoring
      const priceRange = this.priceRanges[category];
      if (price > 0 && priceRange) {
        if (price >= priceRange.min && price <= priceRange.max) {
          score += 3; // Bonus for price in expected range
        } else if (price > priceRange.max * 2 || price < priceRange.min * 0.1) {
          score -= 2; // Penalty for price way outside range
        }
      }

      categoryScores[category] = score;
    });

    // Find best category
    const sortedCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a);

    const bestCategory = sortedCategories[0][0];
    const confidence = this.calculateConfidence(sortedCategories);

    // Additional metadata
    const suggestions = this.generateSuggestions(text, bestCategory);
    const flags = this.detectFlags(text, price);

    return {
      category: bestCategory,
      confidence: confidence,
      scores: categoryScores,
      suggestions: suggestions,
      flags: flags,
      metadata: {
        wordCount: words.length,
        hasPrice: price > 0,
        estimatedValue: this.estimateValue(bestCategory, text, price)
      }
    };
  }

  /**
   * Calculate confidence score based on category scores
   * @param {Array} sortedCategories - Categories sorted by score
   * @returns {number} Confidence between 0 and 1
   */
  calculateConfidence(sortedCategories) {
    if (sortedCategories.length < 2) return 0.5;

    const [best, second] = sortedCategories;
    const [,bestScore] = best;
    const [,secondScore] = second;

    if (bestScore === 0) return 0.1;
    if (secondScore === 0) return 0.9;

    const ratio = bestScore / (bestScore + secondScore);
    return Math.max(0.1, Math.min(0.9, ratio));
  }

  /**
   * Generate suggestions for improving the ad
   * @param {string} text - Ad text
   * @param {string} category - Detected category
   * @returns {Array} Array of suggestions
   */
  generateSuggestions(text, category) {
    const suggestions = [];

    // Check for common missing information
    if (category === 'vehicles' && !text.includes('year') && !text.match(/20\d{2}/)) {
      suggestions.push('Consider adding the year of the vehicle');
    }

    if (category === 'electronics' && !text.includes('condition') && !text.includes('new') && !text.includes('used')) {
      suggestions.push('Specify the condition of the item (new, used, refurbished)');
    }

    if (category === 'real-estate' && !text.includes('bedroom') && !text.includes('br')) {
      suggestions.push('Include number of bedrooms and bathrooms');
    }

    if (category === 'clothing' && !text.includes('size')) {
      suggestions.push('Add size information');
    }

    if (text.length < 50) {
      suggestions.push('Add more details to attract buyers');
    }

    if (!text.includes('excellent') && !text.includes('good') && !text.includes('great')) {
      suggestions.push('Highlight positive aspects of your item');
    }

    return suggestions;
  }

  /**
   * Detect potential issues or flags in the ad
   * @param {string} text - Ad text
   * @param {number} price - Ad price
   * @returns {Array} Array of flags
   */
  detectFlags(text, price) {
    const flags = [];

    // Spam detection
    const spamWords = ['guaranteed', 'free money', 'work from home', 'make money fast', 'no experience needed'];
    if (spamWords.some(word => text.includes(word))) {
      flags.push({ type: 'spam', message: 'Potential spam content detected' });
    }

    // Price flags
    if (price === 0 || text.includes('free')) {
      flags.push({ type: 'info', message: 'Free item - verify legitimacy' });
    }

    if (price > 100000) {
      flags.push({ type: 'warning', message: 'High-value item - extra verification recommended' });
    }

    // Contact info in description (should use proper fields)
    if (text.match(/\d{3}[-.\s]\d{3}[-.\s]\d{4}/) || text.includes('@')) {
      flags.push({ type: 'info', message: 'Contact info detected in description' });
    }

    // Multiple exclamation marks (potential spam)
    if (text.match(/!{3,}/)) {
      flags.push({ type: 'warning', message: 'Excessive punctuation detected' });
    }

    return flags;
  }

  /**
   * Estimate market value range for an item
   * @param {string} category - Item category
   * @param {string} text - Ad text
   * @param {number} price - Listed price
   * @returns {Object} Value estimation
   */
  estimateValue(category, text, price) {
    const baseRange = this.priceRanges[category];
    if (!baseRange || price === 0) {
      return { range: null, assessment: 'Unable to estimate' };
    }

    let multiplier = 1;

    // Adjust based on condition keywords
    if (text.includes('new') || text.includes('brand new')) {
      multiplier = 1.2;
    } else if (text.includes('excellent') || text.includes('like new')) {
      multiplier = 1.0;
    } else if (text.includes('good')) {
      multiplier = 0.8;
    } else if (text.includes('fair') || text.includes('used')) {
      multiplier = 0.6;
    } else if (text.includes('poor') || text.includes('damaged')) {
      multiplier = 0.4;
    }

    const estimatedMin = Math.floor(baseRange.min * multiplier);
    const estimatedMax = Math.floor(baseRange.max * multiplier);

    let assessment = 'Fair price';
    if (price < estimatedMin * 0.7) {
      assessment = 'Below market value';
    } else if (price > estimatedMax * 1.3) {
      assessment = 'Above market value';
    } else if (price >= estimatedMin && price <= estimatedMax) {
      assessment = 'Good market price';
    }

    return {
      range: { min: estimatedMin, max: estimatedMax },
      assessment: assessment
    };
  }

  /**
   * Batch classify multiple ads
   * @param {Array} ads - Array of ad objects
   * @returns {Array} Array of classification results
   */
  batchClassify(ads) {
    return ads.map(ad => ({
      id: ad.id,
      ...this.classifyAd(ad.title, ad.description, ad.price)
    }));
  }

  /**
   * Get category keywords for frontend autocomplete
   * @param {string} category - Category name
   * @returns {Array} Array of keywords
   */
  getCategoryKeywords(category) {
    return this.categories[category] || [];
  }

  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  getAvailableCategories() {
    return Object.keys(this.categories);
  }
}

module.exports = new AIClassificationService();