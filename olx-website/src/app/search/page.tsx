'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter, MapPin, Star, Heart, Share2, X, Menu } from 'lucide-react';
import { getImageProps, getFirstImageUrl, getCategoryDefaultImage } from '@/lib/imageUtils';
import { formatPrice, CATEGORIES, TEXAS_CITIES, CONDITION_TYPES, SORT_OPTIONS, formatLocation } from '@/lib/constants';
import FavoriteButton from '@/components/FavoriteButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Client component for ad image
function AdImage({ ad }: { ad: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = getFirstImageUrl(ad.images, ad.category);
  const imageProps = getImageProps(imageUrl, ad.title);

  return (
    <div className="h-48 sm:h-40 overflow-hidden bg-gray-100 relative">
      {!imageError && (
        <img
          {...imageProps}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Try category-specific fallback first
            if (!target.src.includes('unsplash.com')) {
              target.src = getCategoryDefaultImage(ad.category);
            } else {
              setImageError(true);
            }
          }}
        />
      )}
      {/* Fallback if image fails or while loading */}
      {(!imageLoaded || imageError) && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
          📱 {ad.category}
        </div>
      )}
    </div>
  );
}

// Filters Component (reusable for both desktop and mobile)
function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  condition,
  setCondition,
  location,
  setLocation,
  sortBy,
  setSortBy,
  onClear,
  updateURL
}: {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  priceRange: { min: string; max: string };
  setPriceRange: (range: { min: string; max: string }) => void;
  condition: string;
  setCondition: (cond: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClear: () => void;
  updateURL: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-orange-500" />
          Filters
        </h3>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            updateURL();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ($)"
            value={priceRange.min}
            onChange={(e) => {
              setPriceRange({ ...priceRange, min: e.target.value });
              updateURL();
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max ($)"
            value={priceRange.max}
            onChange={(e) => {
              setPriceRange({ ...priceRange, max: e.target.value });
              updateURL();
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition
        </label>
        <select
          value={condition}
          onChange={(e) => {
            setCondition(e.target.value);
            updateURL();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Any Condition</option>
          {CONDITION_TYPES.map(cond => (
            <option key={cond.value} value={cond.value}>
              {cond.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location (Texas)
        </label>
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            updateURL();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Texas</option>
          {TEXAS_CITIES.filter(c => c.metro).map(city => (
            <option key={city.city} value={city.city}>
              {city.city}, {city.stateCode}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            updateURL();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={onClear}
        variant="outline"
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const [isClient, setIsClient] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Handle search params after component mounts
  useEffect(() => {
    setIsClient(true);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const cond = searchParams.get('condition') || '';
    const loc = searchParams.get('location') || '';
    const sort = searchParams.get('sort') || 'date-desc';

    setSearchQuery(query);
    setSelectedCategory(category);
    setPriceRange({ min: minPrice, max: maxPrice });
    setCondition(cond);
    setLocation(loc);
    setSortBy(sort);
  }, [searchParams]);

  // Fetch ads from API when filters change
  useEffect(() => {
    if (!isClient) return;

    const fetchAds = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query string
        const params = new URLSearchParams();

        if (searchQuery) params.append('q', searchQuery);
        if (selectedCategory) params.append('category', selectedCategory);
        if (priceRange.min) params.append('minPrice', priceRange.min);
        if (priceRange.max) params.append('maxPrice', priceRange.max);
        if (condition) params.append('condition', condition);
        if (location) params.append('location', location);
        params.append('limit', '50'); // Fetch more results

        const response = await fetch(`http://localhost:5000/api/ads?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch ads');
        }

        const data = await response.json();

        if (data.success && data.data?.ads) {
          let fetchedAds = data.data.ads;

          // Apply client-side sorting (since backend might not support all sort options yet)
          switch (sortBy) {
            case 'price-asc':
              fetchedAds.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
              break;
            case 'price-desc':
              fetchedAds.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
              break;
            case 'date-asc':
              fetchedAds.sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              break;
            case 'date-desc':
              fetchedAds.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              break;
            default:
              // Keep default order (relevance)
              break;
          }

          setAds(fetchedAds);
          setTotalResults(data.data.total || fetchedAds.length);
        } else {
          setAds([]);
          setTotalResults(0);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load ads. Please try again later.');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [isClient, searchQuery, selectedCategory, priceRange, condition, location, sortBy]);

  // Update URL with current filter state
  const updateURL = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    if (condition) params.set('condition', condition);
    if (location) params.set('location', location);
    if (sortBy !== 'date-desc') params.set('sort', sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/search?${queryString}` : '/search';

    router.push(newUrl, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setLocation('');
    setSortBy('date-desc');
    router.push('/search');
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Ads'}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for anything in Texas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                <Filter size={20} />
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <FilterPanel
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                condition={condition}
                setCondition={setCondition}
                location={location}
                setLocation={setLocation}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClear={clearFilters}
                updateURL={updateURL}
              />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 rounded-full w-14 h-14 shadow-lg">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    condition={condition}
                    setCondition={setCondition}
                    location={location}
                    setLocation={setLocation}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onClear={clearFilters}
                    updateURL={updateURL}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    Showing {ads.length} result{ads.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && ` in ${CATEGORIES.find(c => c.slug === selectedCategory)?.name}`}
                  </>
                )}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading ads...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Error Loading Ads</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && ads.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">No results found</h2>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search criteria or browse different categories
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && ads.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-0">
                {ads.map((ad) => (
                  <Link key={ad.id} href={`/ad/${ad.id}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                      <AdImage ad={ad} />

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                            {CATEGORIES.find(c => c.id === ad.category || c.slug === ad.category)?.name || ad.category}
                          </span>
                          {ad.views_count > 0 && (
                            <span className="text-xs text-gray-500">
                              {ad.views_count} views
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 flex-1">
                          {ad.title}
                        </h3>

                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {formatPrice(ad.price)}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {ad.location}
                          </span>
                          <span className="text-xs">
                            {new Date(ad.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {ad.condition_type && (
                            <span className="text-sm text-gray-500">
                              {CONDITION_TYPES.find(c => c.value === ad.condition_type)?.label || ad.condition_type}
                            </span>
                          )}
                          <div className="flex space-x-2">
                            <FavoriteButton
                              adId={ad.id}
                              variant="ghost"
                              className="text-gray-400 hover:text-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
