// Utility functions for handling image URLs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get the full URL for an image
 * @param imagePath - The image path (can be relative or absolute)
 * @returns Full image URL
 */
export function getImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1560472354-7cd4f7e4c1c8?w=400&h=300&fit=crop'; // Default fallback
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with '/uploads/', it's a backend path
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // If it doesn't start with '/', add it
  if (!imagePath.startsWith('/')) {
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }

  return `${API_BASE_URL}${imagePath}`;
}

/**
 * Get category-specific default image
 * @param category - Ad category
 * @returns Category-specific default image URL
 */
export function getCategoryDefaultImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    'Cars': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    'Mobiles': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    'Electronics': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    'Property': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    'Fashion': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    'Jobs': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    'Pets': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
    'Services': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    'Books': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    'Buy-Sell': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1560472354-7cd4f7e4c1c8?w=400&h=300&fit=crop'
  };

  return categoryImages[category] || categoryImages['default'];
}

/**
 * Get the first image URL from an array of images with category fallback
 * @param images - Array of image paths
 * @param category - Ad category for fallback image
 * @returns First image URL or category-specific fallback
 */
export function getFirstImageUrl(images: string[] | undefined, category?: string): string {
  if (!images || images.length === 0) {
    return category ? getCategoryDefaultImage(category) : getImageUrl(undefined);
  }
  return getImageUrl(images[0]);
}

/**
 * Validate if an image URL is valid
 * @param imagePath - The image path to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidImageUrl(imagePath: string | undefined): boolean {
  if (!imagePath) return false;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return true;
  if (imagePath.startsWith('/uploads/')) return true;
  return false;
}

/**
 * Create a component-safe image props object
 * @param imagePath - The image path
 * @param alt - Alt text for the image
 * @returns Object with src, alt, and onError props
 */
export function getImageProps(imagePath: string | undefined, alt: string = '') {
  return {
    src: getImageUrl(imagePath),
    alt: alt,
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      target.src = 'https://images.unsplash.com/photo-1560472354-7cd4f7e4c1c8?w=400&h=300&fit=crop';
    }
  };
}