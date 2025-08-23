'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Car, Home, Smartphone, Laptop, Gamepad2, Shirt, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';

// Client component for image with error handling
function AdImage({ ad }: { ad: any }) {
  return (
    <div className="h-48 overflow-hidden bg-gray-100 relative">
      <img
        src={ad.image}
        alt={ad.title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="150" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="%236b7280">📱 ${ad.category}</text></svg>')`
        }}
      />
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
  const categories = [
    { name: 'Cars', icon: Car, color: 'bg-blue-500', href: '/search?category=cars' },
    { name: 'Property', icon: Home, color: 'bg-green-500', href: '/search?category=property' },
    { name: 'Mobiles', icon: Smartphone, color: 'bg-purple-500', href: '/search?category=mobiles' },
    { name: 'Electronics', icon: Laptop, color: 'bg-red-500', href: '/search?category=electronics' },
    { name: 'Gaming', icon: Gamepad2, color: 'bg-indigo-500', href: '/search?category=gaming' },
    { name: 'Fashion', icon: Shirt, color: 'bg-pink-500', href: '/search?category=fashion' },
    { name: 'Books', icon: BookOpen, color: 'bg-yellow-500', href: '/search?category=books' },
  ];

  const [recentAds, setRecentAds] = useState<ApiAd[]>([]);

  useEffect(() => {
    const loadAds = async () => {
      try {
        // Connect to backend API
        const response = await fetch('http://localhost:5000/api/ads?limit=8');
        
        // Check if response is ok and content type is JSON
        if (!response.ok) {
          console.error('Failed to fetch ads:', response.status, response.statusText);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          return;
        }
        
        const data = await response.json();
        if (data.success && data.ads) {
          const mapped: ApiAd[] = data.ads.map((ad: any) => ({
            id: ad.id.toString(),
            title: ad.title,
            price: `₹${ad.price}`,
            location: ad.location,
            images: ad.images || [],
            category: ad.category,
          }));
          setRecentAds(mapped);
        }
      } catch (e) {
        console.error('Error loading ads:', e);
        // Fallback to empty array if backend is not available
        setRecentAds([]);
      }
    };
    loadAds();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Buy and Sell Everything
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            India's trusted marketplace for buying and selling
          </p>
          
          {/* Hero Search */}
          <div className="max-w-2xl mx-auto">
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-6 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 shadow-lg"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Search size={20} className="mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group text-center"
              >
                <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-200 shadow-lg group-hover:shadow-xl`}>
                  <category.icon size={32} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              Recent Ads
            </h2>
            <Link
              href="/search"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentAds.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No ads yet. Be the first to post!</div>
            )}
            {recentAds.map((ad) => (
              <div 
                key={ad.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                  ''
                }`}
              >
                <AdImage ad={{ title: ad.title, image: ad.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop&crop=center', category: ad.category }} />
                <div className="p-4">
                  <span className="text-xs text-blue-600 font-medium uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-full">
                    {ad.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1 mb-2 line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {ad.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {ad.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Sell Something?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Post your ad for free and reach millions of buyers
          </p>
          <Link
            href="/post-ad"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
          >
            <Search size={20} className="mr-2" />
            Post Free Ad
          </Link>
        </div>
      </section>
    </div>
  );
}
