/**
 * Shared Image Helper Utilities
 * Consolidates duplicate image parsing and URL normalization
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Parse images from string or return array as-is
const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      return JSON.parse(images);
    } catch (e) {
      return [];
    }
  }
  return [];
};

// Normalize image URLs to full URLs
const normalizeImageUrls = (images) => {
  const parsedImages = parseImages(images);

  return parsedImages.map(imagePath => {
    if (!imagePath) return '';

    // If already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it starts with '/uploads/', convert to full URL
    if (imagePath.startsWith('/uploads/')) {
      return `${BASE_URL}${imagePath}`;
    }

    // If it doesn't start with '/', add uploads prefix
    if (!imagePath.startsWith('/')) {
      return `${BASE_URL}/uploads/${imagePath}`;
    }

    return `${BASE_URL}${imagePath}`;
  });
};

// Process ad object to normalize images
const normalizeAdImages = (ad) => {
  if (!ad) return ad;
  return {
    ...ad,
    images: normalizeImageUrls(ad.images)
  };
};

// Process array of ads to normalize images
const normalizeAdsImages = (ads) => {
  if (!Array.isArray(ads)) return ads;
  return ads.map(normalizeAdImages);
};

module.exports = {
  parseImages,
  normalizeImageUrls,
  normalizeAdImages,
  normalizeAdsImages
};
