/**
 * SEO Helper Utilities
 * Auto-generates SEO-optimized content for advertisements
 */

/**
 * Generate SEO-optimized title from ad details
 * @param {string} title - Original ad title
 * @param {string} category - Ad category
 * @param {string} condition - Item condition
 * @param {string} location - Ad location
 * @returns {string} SEO-optimized title
 */
function generateSeoTitle(title, category, condition, location) {
  // Format: "{Title} - {Condition} {Category} for Sale in {Location} | EasyBuySale"
  const parts = [];

  if (title) {
    parts.push(title.trim());
  }

  if (condition && condition !== 'used') {
    parts.push(capitalizeFirst(condition));
  }

  if (category) {
    parts.push(capitalizeFirst(category));
  }

  parts.push('for Sale');

  if (location) {
    parts.push(`in ${location.trim()}`);
  }

  const seoTitle = parts.join(' ');

  // Limit to 60 characters for optimal SEO (Google displays ~60 chars in search results)
  if (seoTitle.length > 60) {
    return seoTitle.substring(0, 57) + '...';
  }

  return seoTitle;
}

/**
 * Generate SEO-optimized meta description
 * @param {string} description - Original ad description
 * @param {number} price - Ad price
 * @param {string} condition - Item condition
 * @param {string} location - Ad location
 * @returns {string} SEO-optimized meta description
 */
function generateSeoDescription(description, price, condition, location) {
  // Format description to 155-160 characters for optimal SEO
  let seoDesc = '';

  if (description) {
    seoDesc = description.trim();
  }

  // Add price and condition info
  const priceInfo = price ? ` Price: $${price}.` : '';
  const conditionInfo = condition ? ` Condition: ${capitalizeFirst(condition)}.` : '';
  const locationInfo = location ? ` Located in ${location}.` : '';

  const fullDesc = seoDesc + priceInfo + conditionInfo + locationInfo + ' Buy now on EasyBuySale!';

  // Limit to 160 characters for optimal SEO
  if (fullDesc.length > 160) {
    return fullDesc.substring(0, 157) + '...';
  }

  return fullDesc;
}

/**
 * Generate SEO keywords from ad details
 * @param {string} title - Ad title
 * @param {string} category - Ad category
 * @param {string} condition - Item condition
 * @param {string} location - Ad location
 * @param {string} description - Ad description
 * @returns {string[]} Array of SEO keywords
 */
function generateSeoKeywords(title, category, condition, location, description) {
  const keywords = new Set();

  // Add category
  if (category) {
    keywords.add(category.toLowerCase());
    keywords.add(`${category.toLowerCase()} for sale`);
    keywords.add(`buy ${category.toLowerCase()}`);
  }

  // Add condition
  if (condition) {
    keywords.add(condition.toLowerCase());
    keywords.add(`${condition.toLowerCase()} ${category?.toLowerCase() || ''}`);
  }

  // Add location
  if (location) {
    keywords.add(location.toLowerCase());
    keywords.add(`${category?.toLowerCase() || ''} in ${location.toLowerCase()}`);
  }

  // Extract important words from title (3+ characters)
  if (title) {
    const titleWords = title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 3 && !isCommonWord(word));
    titleWords.forEach(word => keywords.add(word));
  }

  // Extract important words from description (3+ characters, limit to 5)
  if (description) {
    const descWords = description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 3 && !isCommonWord(word))
      .slice(0, 5);
    descWords.forEach(word => keywords.add(word));
  }

  // Generic marketplace keywords
  keywords.add('marketplace');
  keywords.add('classified ads');
  keywords.add('online shopping');

  // Convert Set to Array and limit to 15 keywords
  return Array.from(keywords).slice(0, 15);
}

/**
 * Generate structured data (Schema.org) for an ad
 * @param {Object} ad - Advertisement object
 * @returns {Object} JSON-LD structured data
 */
function generateStructuredData(ad) {
  const baseUrl = process.env.FRONTEND_URL || 'https://easybuysale.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ad.title,
    description: ad.description,
    image: ad.images && ad.images.length > 0 ? ad.images : undefined,
    offers: {
      '@type': 'Offer',
      price: ad.price,
      priceCurrency: 'USD',
      availability: ad.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: getSchemaCondition(ad.condition_type),
      seller: {
        '@type': 'Person',
        name: ad.seller_name || 'EasyBuySale User'
      }
    },
    category: ad.category,
    url: `${baseUrl}/ad/${ad.id}`,
    datePublished: ad.created_at
  };
}

/**
 * Helper: Capitalize first letter of a string
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Helper: Check if word is a common stop word
 */
function isCommonWord(word) {
  const stopWords = [
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were',
    'been', 'have', 'has', 'had', 'but', 'not', 'you', 'all', 'can', 'will',
    'about', 'into', 'than', 'them', 'these', 'only', 'other', 'such', 'when'
  ];
  return stopWords.includes(word.toLowerCase());
}

/**
 * Helper: Map condition type to Schema.org condition
 */
function getSchemaCondition(conditionType) {
  const conditionMap = {
    'new': 'https://schema.org/NewCondition',
    'like-new': 'https://schema.org/NewCondition',
    'good': 'https://schema.org/UsedCondition',
    'fair': 'https://schema.org/UsedCondition',
    'poor': 'https://schema.org/UsedCondition',
    'used': 'https://schema.org/UsedCondition',
    'refurbished': 'https://schema.org/RefurbishedCondition'
  };

  return conditionMap[conditionType] || 'https://schema.org/UsedCondition';
}

module.exports = {
  generateSeoTitle,
  generateSeoDescription,
  generateSeoKeywords,
  generateStructuredData
};
