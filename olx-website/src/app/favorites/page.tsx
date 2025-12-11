'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MapPin, Calendar, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getImageProps, getFirstImageUrl } from '@/lib/imageUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FavoriteAd {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  images: string[];
  saved_at: string;
  is_active: boolean;
}

export default function FavoritesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteAd[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteAd[]>([]);

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingFavorites(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedFavorites = data.favorites.map((fav: any) => ({
            id: fav.id.toString(),
            title: fav.title,
            price: `₹${fav.price.toLocaleString()}`,
            category: fav.category,
            location: fav.location,
            images: Array.isArray(fav.images) ? fav.images : [],
            saved_at: fav.saved_at,
            is_active: fav.is_active
          }));
          setFavorites(formattedFavorites);
          setFilteredFavorites(formattedFavorites);
        }
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchFavorites();
    } else {
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = favorites.filter(fav =>
        fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [searchQuery, favorites]);

  const handleRemoveFavorite = async (adId: string) => {
    if (!confirm('Remove this ad from your favorites?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/favorites/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedFavorites = favorites.filter(fav => fav.id !== adId);
        setFavorites(updatedFavorites);
        setFilteredFavorites(updatedFavorites.filter(fav =>
          searchQuery.trim() === '' ||
          fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.location.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      } else {
        console.error('Failed to remove favorite');
        alert('Failed to remove from favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your favorites</h1>
          <p className="text-gray-600 mb-6">Save ads you love and access them anytime</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 underline">
            Login here
          </Link>
        </div>
      </div>
    );
  }

  if (loadingFavorites) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              My Favorites
            </h1>
            <p className="text-gray-600 mt-2">
              {favorites.length} saved {favorites.length === 1 ? 'ad' : 'ads'}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No favorites yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start browsing ads and click the heart icon to save your favorites here.
            </p>
            <Link href="/search">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Browse Ads
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6">
                <p className="text-gray-600">
                  {filteredFavorites.length} result{filteredFavorites.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}

            {/* Favorites Grid */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No matching favorites</h2>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFavorites.map((favorite) => (
                  <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        {...getImageProps(getFirstImageUrl(favorite.images, favorite.category), favorite.title)}
                        className="w-full h-full object-cover"
                      />

                      {!favorite.is_active && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <Badge variant="destructive">No Longer Available</Badge>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {favorite.category}
                        </Badge>
                        <span className="text-lg font-bold text-blue-600">
                          {favorite.price}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {favorite.title}
                      </h3>

                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {favorite.location}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Saved {new Date(favorite.saved_at).toLocaleDateString()}
                        </div>

                        <Link href={`/ad/${favorite.id}`}>
                          <Button
                            size="sm"
                            variant={favorite.is_active ? "default" : "secondary"}
                            disabled={!favorite.is_active}
                          >
                            {favorite.is_active ? 'View Details' : 'Unavailable'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}