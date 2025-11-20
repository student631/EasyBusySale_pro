// Application-wide constants and configuration for EasyBuySale Texas Market

// ============================================================================
// CURRENCY CONFIGURATION
// ============================================================================
export const CURRENCY = {
  code: 'USD',
  symbol: '$',
  position: 'before', // 'before' = $100, 'after' = 100$
  decimals: 0, // For whole dollar amounts like $1,200
  decimalSeparator: '.',
  thousandsSeparator: ',',
} as const;

/**
 * Format price with currency symbol
 * @param price - Price as number or string
 * @param includeDecimals - Whether to show cents (default: false for whole dollars)
 * @returns Formatted price string (e.g., "$1,200" or "$1,200.00")
 */
export function formatPrice(
  price: number | string,
  includeDecimals: boolean = false
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return `${CURRENCY.symbol}0`;
  }

  const formatted = includeDecimals
    ? numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

  return CURRENCY.position === 'before'
    ? `${CURRENCY.symbol}${formatted}`
    : `${formatted}${CURRENCY.symbol}`;
}

/**
 * Parse price string to number (removes currency symbols and formatting)
 * @param priceString - Price string like "$1,200" or "1200"
 * @returns Number value
 */
export function parsePrice(priceString: string): number {
  return parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
}

// ============================================================================
// LOCATION CONFIGURATION - TEXAS FOCUS
// ============================================================================

export interface Location {
  city: string;
  state: string;
  stateCode: string;
  county?: string;
  population?: number;
  metro?: boolean;
}

// Major Texas cities for initial launch
export const TEXAS_CITIES: Location[] = [
  { city: 'Austin', state: 'Texas', stateCode: 'TX', population: 2300000, metro: true },
  { city: 'Dallas', state: 'Texas', stateCode: 'TX', population: 8000000, metro: true },
  { city: 'Fort Worth', state: 'Texas', stateCode: 'TX', population: 8000000, metro: true },
  { city: 'Houston', state: 'Texas', stateCode: 'TX', population: 7500000, metro: true },
  { city: 'San Antonio', state: 'Texas', stateCode: 'TX', population: 2600000, metro: true },
  { city: 'El Paso', state: 'Texas', stateCode: 'TX', population: 680000, metro: false },
  { city: 'Arlington', state: 'Texas', stateCode: 'TX', population: 400000, metro: false },
  { city: 'Corpus Christi', state: 'Texas', stateCode: 'TX', population: 430000, metro: false },
  { city: 'Plano', state: 'Texas', stateCode: 'TX', population: 290000, metro: false },
  { city: 'Lubbock', state: 'Texas', stateCode: 'TX', population: 330000, metro: false },
  { city: 'Irving', state: 'Texas', stateCode: 'TX', population: 260000, metro: false },
  { city: 'Laredo', state: 'Texas', stateCode: 'TX', population: 260000, metro: false },
  { city: 'Garland', state: 'Texas', stateCode: 'TX', population: 240000, metro: false },
  { city: 'Frisco', state: 'Texas', stateCode: 'TX', population: 200000, metro: false },
  { city: 'McKinney', state: 'Texas', stateCode: 'TX', population: 200000, metro: false },
];

// Get formatted location string
export function formatLocation(city: string, state: string): string {
  return `${city}, ${state}`;
}

// Get location display for Texas cities
export function getLocationDisplay(location: Location): string {
  return `${location.city}, ${location.stateCode}`;
}

// Default location for initial page load
export const DEFAULT_LOCATION = TEXAS_CITIES[0]; // Austin

// ============================================================================
// CATEGORY CONFIGURATION - CENTRALIZED
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Icon name from lucide-react
  description: string;
  color: string; // Tailwind color classes
  subcategories?: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'vehicles',
    name: 'Cars & Vehicles',
    slug: 'vehicles',
    icon: 'Car',
    description: 'Cars, trucks, motorcycles, RVs, and auto parts',
    color: 'bg-blue-100 text-blue-700',
    subcategories: ['Cars', 'Trucks', 'SUVs', 'Motorcycles', 'RVs', 'Boats', 'Auto Parts'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'Home',
    description: 'Houses, apartments, land, and commercial properties',
    color: 'bg-green-100 text-green-700',
    subcategories: ['Houses', 'Apartments', 'Land', 'Commercial', 'Roommates'],
  },
  {
    id: 'jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: 'Briefcase',
    description: 'Job opportunities and career listings',
    color: 'bg-purple-100 text-purple-700',
    subcategories: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Laptop',
    description: 'Computers, phones, TVs, cameras, and gadgets',
    color: 'bg-indigo-100 text-indigo-700',
    subcategories: ['Computers', 'Phones', 'TVs', 'Cameras', 'Audio', 'Gaming'],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    slug: 'furniture',
    icon: 'Armchair',
    description: 'Home and office furniture',
    color: 'bg-amber-100 text-amber-700',
    subcategories: ['Sofas', 'Tables', 'Beds', 'Chairs', 'Storage', 'Office'],
  },
  {
    id: 'business',
    name: 'Business for Sale',
    slug: 'business',
    icon: 'TrendingUp',
    description: 'Existing businesses, franchises, and commercial opportunities',
    color: 'bg-emerald-100 text-emerald-700',
    subcategories: ['Restaurants', 'Retail', 'Online Business', 'Franchise', 'Service Business'],
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    icon: 'Users',
    description: 'Professional services, home services, and contractors',
    color: 'bg-red-100 text-red-700',
    subcategories: ['Home Services', 'Professional', 'Tutoring', 'Events', 'Auto Services'],
  },
  {
    id: 'pets',
    name: 'Pets',
    slug: 'pets',
    icon: 'Heart',
    description: 'Pets, pet supplies, and pet services',
    color: 'bg-pink-100 text-pink-700',
    subcategories: ['Dogs', 'Cats', 'Birds', 'Fish', 'Pet Supplies', 'Pet Services'],
  },
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    slug: 'clothing',
    icon: 'ShoppingBag',
    description: 'Clothing, shoes, accessories, and jewelry',
    color: 'bg-rose-100 text-rose-700',
    subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Jewelry'],
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    slug: 'sports',
    icon: 'Dumbbell',
    description: 'Sports equipment, fitness gear, and outdoor items',
    color: 'bg-cyan-100 text-cyan-700',
    subcategories: ['Fitness', 'Bicycles', 'Camping', 'Sports Equipment', 'Hunting & Fishing'],
  },
  {
    id: 'equipment',
    name: 'Tools & Equipment',
    slug: 'equipment',
    icon: 'Wrench',
    description: 'Construction tools, machinery, and equipment',
    color: 'bg-slate-100 text-slate-700',
    subcategories: ['Power Tools', 'Hand Tools', 'Heavy Equipment', 'Industrial'],
  },
  {
    id: 'books',
    name: 'Books & Education',
    slug: 'books',
    icon: 'BookOpen',
    description: 'Books, textbooks, and educational materials',
    color: 'bg-violet-100 text-violet-700',
    subcategories: ['Textbooks', 'Fiction', 'Non-fiction', 'Children', 'Educational'],
  },
];

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

// Get category by id
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

// ============================================================================
// CONDITION TYPES
// ============================================================================

export const CONDITION_TYPES = [
  { value: 'new', label: 'Brand New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for-parts', label: 'For Parts' },
] as const;

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'relevance', label: 'Most Relevant' },
] as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  retryAttempts: 3,
} as const;

// ============================================================================
// PRICE RANGES FOR FILTERS
// ============================================================================

export const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $500', min: 100, max: 500 },
  { label: '$500 - $1,000', min: 500, max: 1000 },
  { label: '$1,000 - $5,000', min: 1000, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $25,000', min: 10000, max: 25000 },
  { label: '$25,000+', min: 25000, max: Infinity },
] as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION = {
  title: {
    minLength: 3,
    maxLength: 200,
  },
  description: {
    minLength: 10,
    maxLength: 5000,
  },
  price: {
    min: 0,
    max: 10000000, // $10 million max
  },
  images: {
    maxCount: 5,
    maxSize: 5 * 1024 * 1024, // 5MB per image
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
} as const;
