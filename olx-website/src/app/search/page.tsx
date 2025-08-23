'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, MapPin, Star, Heart, Share2 } from 'lucide-react';

// Client component for ad image
function AdImage({ ad }: { ad: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="h-48 overflow-hidden bg-gray-100 relative">
      {!imageError && (
        <img
          src={ad.image}
          alt={ad.title}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isClient, setIsClient] = useState(false);

  // Handle search params after component mounts
  useEffect(() => {
    setIsClient(true);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    
    setSearchQuery(query);
    setSelectedCategory(category);
  }, [searchParams]);

  // Mock search results with real images - in real app, this would come from API
  const mockResults = [
    {
      id: 1,
      title: 'iPhone 13 Pro - Excellent Condition',
      price: '₹45,000',
      location: 'Mumbai, Maharashtra',
      category: 'Mobiles',
      condition: 'Good',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop&crop=center',
      postedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'Honda City 2018 Model',
      price: '₹8,50,000',
      location: 'Delhi, NCR',
      category: 'Cars',
      condition: 'Good',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop&crop=center',
      postedDate: '1 week ago'
    },
    {
      id: 3,
      title: '2BHK Apartment for Rent',
      price: '₹25,000/month',
      location: 'Bangalore, Karnataka',
      category: 'Property',
      condition: 'New',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop&crop=center',
      postedDate: '3 days ago'
    },
    {
      id: 4,
      title: 'MacBook Air M1 2020',
      price: '₹65,000',
      location: 'Pune, Maharashtra',
      category: 'Electronics',
      condition: 'Like New',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop&crop=center',
      postedDate: '5 days ago'
    },
    {
      id: 5,
      title: 'Samsung Galaxy S21',
      price: '₹35,000',
      location: 'Chennai, Tamil Nadu',
      category: 'Mobiles',
      condition: 'Good',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop&crop=center',
      postedDate: '1 day ago'
    },
    {
      id: 6,
      title: 'Maruti Swift 2019',
      price: '₹6,50,000',
      location: 'Hyderabad, Telangana',
      category: 'Cars',
      condition: 'Good',
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop&crop=center',
      postedDate: '4 days ago'
    },
    {
      id: 7,
      title: 'Gaming Laptop RTX 3060',
      price: '₹75,000',
      location: 'Kolkata, West Bengal',
      category: 'Electronics',
      condition: 'Like New',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=200&fit=crop&crop=center',
      postedDate: '2 days ago'
    },
    {
      id: 8,
      title: 'PS5 Console with 2 Controllers',
      price: '₹55,000',
      location: 'Ahmedabad, Gujarat',
      category: 'Gaming',
      condition: 'Good',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&h=200&fit=crop&crop=center',
      postedDate: '1 week ago'
    },
    {
      id: 9,
      title: 'Designer Handbag Collection',
      price: '₹12,000',
      location: 'Jaipur, Rajasthan',
      category: 'Fashion',
      condition: 'New',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=200&fit=crop&crop=center',
      postedDate: '3 days ago'
    }
  ];



  const categories = [
    'All Categories', 'Mobiles', 'Cars', 'Property', 'Electronics', 'Fashion', 'Books'
  ];

  const conditions = ['Any', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic
  };

  const handleFilterChange = () => {
    // TODO: Apply filters and update results
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
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Ads'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for anything..."
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
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-orange-500" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => {
                      setPriceRange(prev => ({ ...prev, min: e.target.value }));
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => {
                      setPriceRange(prev => ({ ...prev, max: e.target.value }));
                      handleFilterChange();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => {
                    setCondition(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {conditions.map(cond => (
                    <option key={cond} value={cond === 'Any' ? '' : cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="date">Date Posted</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setPriceRange({ min: '', max: '' });
                  setCondition('');
                  setLocation('');
                  setSortBy('relevance');
                }}
                className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {mockResults.length} results
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockResults.map((ad) => (
                <div 
                  key={ad.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                    ad.title.includes('Samsung') ? 'border-2 border-red-500 bg-red-50' : ''
                  }`}
                >
                  <AdImage ad={ad} />
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
                        {ad.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{ad.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {ad.title}
                    </h3>
                    
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {ad.price}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {ad.location}
                      </span>
                      <span>{ad.postedDate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Condition: {ad.condition}
                      </span>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {mockResults.length > 0 && (
              <div className="text-center mt-8">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
