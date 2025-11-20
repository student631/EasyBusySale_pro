'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Car, Smartphone, Laptop, Home, Briefcase, ShoppingBag, Heart, Users, MapPin, TrendingUp, Clock, ChevronRight, Armchair, Dumbbell, BookOpen, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getImageProps, getFirstImageUrl, getCategoryDefaultImage } from '@/lib/imageUtils';
import { formatPrice, CATEGORIES, TEXAS_CITIES } from '@/lib/constants';
import StatsSection from '@/components/StatsSection';
import FavoriteButton from '@/components/FavoriteButton';

// Client component for image with error handling
function AdImage({ ad }: { ad: any }) {
  const imageUrl = getFirstImageUrl(ad.images, ad.category);
  const imageProps = getImageProps(imageUrl, ad.title);

  return (
    <div className="h-48 overflow-hidden bg-gray-100 relative group">
      <img
        {...imageProps}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback to category-specific image if original fails
          target.src = getCategoryDefaultImage(ad.category);
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

type ApiAd = {
  id: string;
  title: string;
  price: string;
  location: string;
  images?: string[];
  category: string;
};

export default function HomePage() {
  // Map icon names from constants to actual icon components
  const iconMap: Record<string, any> = {
    Car, Home, Briefcase, Laptop, Armchair, TrendingUp, Users, Heart, ShoppingBag, Dumbbell, Wrench, BookOpen, Smartphone
  };

  const categories = CATEGORIES.slice(0, 8).map(cat => ({
    name: cat.name,
    icon: iconMap[cat.icon] || ShoppingBag,
    href: `/search?category=${cat.slug}`,
    color: cat.color
  }));

  const popularSearches = [
    'iPhone', 'Car', 'Apartment', 'Job', 'Bike', 'Laptop', 'Sofa', 'Table'
  ];

  const [recentAds, setRecentAds] = useState<ApiAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadAds = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:5000/api/ads?limit=8&_t=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        console.log('🔥 API Response received:', data);

        if (data.success && data.data?.ads) {
          const mapped: ApiAd[] = data.data.ads.map((ad: any) => ({
            id: ad.id.toString(),
            title: ad.title,
            price: formatPrice(ad.price),
            location: ad.location,
            images: ad.images || [],
            category: ad.category,
          }));
          console.log('🎯 Mapped ads for display:', mapped.length);
          console.log('📸 First ad images:', mapped[0]?.images);
          setRecentAds(mapped);
          console.log('✅ Successfully loaded ads from backend');
          return;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        console.log('❌ API Error:', errorMessage);
        console.log('🔄 Retrying API call in 2 seconds...');

        // Retry once after 2 seconds instead of showing fallback immediately
        setTimeout(async () => {
          try {
            console.log('🔄 Retry attempt...');
            const retryResponse = await fetch('http://localhost:5000/api/ads?limit=8');
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.success && retryData.data?.ads) {
                const mapped: ApiAd[] = retryData.data.ads.map((ad: any) => ({
                  id: ad.id.toString(),
                  title: ad.title,
                  price: formatPrice(ad.price),
                  location: ad.location,
                  images: ad.images || [],
                  category: ad.category,
                }));
                setRecentAds(mapped);
                setError(null);
                console.log('✅ Retry successful! Real data loaded.');
                return;
              }
            }
          } catch (retryError) {
            console.log('❌ Retry failed, using Texas fallback data');
          }

          // Only show fallback after retry fails - using Texas locations
          const fallbackAds: ApiAd[] = [
          {
            id: '1',
            title: '2020 Ford F-150 XLT - Low Miles',
            price: formatPrice(32500),
            location: 'Dallas, TX',
            images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop'],
            category: 'vehicles',
          },
          {
            id: '2',
            title: 'iPhone 15 Pro Max 256GB - Like New',
            price: formatPrice(1100),
            location: 'Austin, TX',
            images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
            category: 'electronics',
          },
          {
            id: '3',
            title: 'Modern 2BR Apartment Downtown Austin',
            price: formatPrice(1850) + '/month',
            location: 'Austin, TX',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
            category: 'real-estate',
          },
          {
            id: '4',
            title: 'Full Stack Developer - Tech Startup',
            price: formatPrice(95000) + '/year',
            location: 'Austin, TX',
            images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop'],
            category: 'jobs',
          },
          {
            id: '5',
            title: 'Leather Sectional Sofa - Brown',
            price: formatPrice(850),
            location: 'Houston, TX',
            images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
            category: 'furniture',
          },
          {
            id: '6',
            title: 'Giant Mountain Bike - 29"',
            price: formatPrice(650),
            location: 'San Antonio, TX',
            images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
            category: 'sports',
          },
          {
            id: '7',
            title: 'Labrador Retriever Puppies',
            price: formatPrice(800),
            location: 'Fort Worth, TX',
            images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'],
            category: 'pets',
          },
          {
            id: '8',
            title: 'Professional Landscaping Service',
            price: formatPrice(200) + '/visit',
            location: 'Dallas, TX',
            images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'],
            category: 'services',
          },
          {
            id: '9',
            title: 'MacBook Pro 14" M3 (2024)',
            price: formatPrice(1899),
            location: 'Austin, TX',
            images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'],
            category: 'electronics',
          },
          {
            id: '10',
            title: '2021 Chevy Silverado 1500',
            price: formatPrice(38900),
            location: 'Houston, TX',
            images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop'],
            category: 'vehicles',
          },
          {
            id: '11',
            title: 'Established Mexican Restaurant',
            price: formatPrice(250000),
            location: 'El Paso, TX',
            images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop'],
            category: 'business',
          },
          {
            id: '12',
            title: 'Samsung 75" 4K QLED Smart TV',
            price: formatPrice(1200),
            location: 'San Antonio, TX',
            images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'],
            category: 'electronics',
          }
          ];
          setRecentAds(fallbackAds);
          setError('Backend server not accessible. Showing sample data.');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    loadAds();
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 lg:py-12">
          <div className="text-center mb-4">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Find it. Get it.
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent"> EasyBuySale it.</span>
            </h1>
            <p className="text-sm lg:text-lg text-blue-100 mb-4 max-w-2xl mx-auto leading-snug">
              Texas's #1 Marketplace. Buy, sell, and connect with people across the Lone Star State.
            </p>
          </div>

          {/* Enhanced Search Bar - Compact */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl blur opacity-50"></div>
              <div className="relative bg-white rounded-xl shadow-xl p-1.5">
                <div className="flex">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 rounded-l-lg text-sm h-10 focus:ring-0 focus:border-transparent bg-transparent text-gray-800 placeholder-gray-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-r-lg px-4 h-10 text-sm font-semibold shadow-lg transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Dynamic Stats */}
          <StatsSection />
        </div>

        {/* Floating Elements - Smaller */}
        <div className="absolute top-10 left-10 w-12 h-12 bg-orange-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-20 right-10 w-10 h-10 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Categories Grid - Compact */}
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Categories</h2>
            <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={category.href}
                className="group"
              >
                <div className="relative">
                  {/* Glassmorphism Card - Compact */}
                  <div className="backdrop-blur-sm bg-white/80 border border-white/20 rounded-2xl p-4 text-center transition-all duration-500 group-hover:backdrop-blur-md group-hover:bg-white/90 group-hover:shadow-xl group-hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <div className="relative">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${category.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-xs group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <div className="mt-1 w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto transition-all duration-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Floating Animation - Smaller */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-${index * 100}`}></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings - Compact */}
      <section className="py-8 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">Discover the hottest deals in your area</p>
            <Link href="/search" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold group">
              View all listings
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAds.slice(0, 8).map((ad, index) => (
              <div key={ad.id} className="group">
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/90 border border-white/20 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-2">
                  {/* Image Container - Compact */}
                  <div className="relative h-36 overflow-hidden">
                    <img
                      {...getImageProps(getFirstImageUrl(ad.images, ad.category), ad.title)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Favorite Button - Compact */}
                    <div className="absolute top-2 right-2">
                      <FavoriteButton
                        adId={ad.id}
                        variant="ghost"
                        className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110"
                      />
                    </div>

                    {/* Price Badge - Compact */}
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md">
                        <span className="text-sm font-bold text-blue-600">{ad.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content - Compact */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{Math.floor(Math.random() * 24) + 1}h ago</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        index % 4 === 0 ? 'bg-blue-100 text-blue-700' :
                        index % 4 === 1 ? 'bg-green-100 text-green-700' :
                        index % 4 === 2 ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {ad.category}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                      {ad.title}
                    </h3>

                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="text-xs">{ad.location}</span>
                    </div>

                    {/* Hover CTA - Compact */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Link href={`/ad/${ad.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-1.5 text-xs rounded-lg shadow-md">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Compact */}
      <section className="py-8 bg-blue-600">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Got something to sell?
          </h2>
          <p className="text-sm text-blue-100 mb-4 max-w-xl mx-auto">
            Post your ad on EasyBuySale and reach thousands of people looking for your item
          </p>
          <Link href="/post-ad">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-2 text-sm h-9">
              Post Your Ad
            </Button>
          </Link>
        </div>
      </section>

      {/* App Download - Compact */}
      <section className="py-6 bg-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Take EasyBuySale with you
              </h3>
              <p className="text-gray-600 text-xs">
                Download our mobile app for the best buying and selling experience
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs h-8">
                <span>📱</span>
                <span>App Store</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs h-8">
                <span>🤖</span>
                <span>Google Play</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}