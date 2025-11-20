'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Edit, Trash2, Eye, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getImageProps, getFirstImageUrl, getCategoryDefaultImage } from '@/lib/imageUtils';

interface Ad {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  images: string[];
  views_count: number;
  created_at: string;
  is_active: boolean;
}

export default function MyAdsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchMyAds();
    }
  }, [isAuthenticated, loading]);

  const fetchMyAds = async () => {
    try {
      setLoadingAds(true);
      const response = await apiClient.getMyAds();
      console.log('getMyAds response:', response);

      if (response.success && response.data) {
        // Backend returns { success: true, data: ads }
        // API client wraps it in another layer, so response.data contains the backend response
        const adsData = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setAds(adsData);
      } else {
        setError('Failed to fetch your ads');
      }
    } catch (err) {
      setError('Error loading your ads');
      console.error('Error fetching my ads:', err);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      const response = await apiClient.deleteAd(adId);
      if (response.success) {
        setAds(ads.filter(ad => ad.id !== adId));
        alert('Ad deleted successfully');
      } else {
        alert('Failed to delete ad: ' + response.error);
      }
    } catch (err) {
      alert('Error deleting ad');
      console.error('Error deleting ad:', err);
    }
  };

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your ads</h1>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 underline">
            Login here
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
            <p className="text-gray-600 mt-2">Manage your advertisements</p>
          </div>
          <Link href="/post-ad">
            <Button className="easysale-post-ad-btn">
              <Plus className="h-4 w-4 mr-2" />
              Post New Ad
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loadingAds ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No ads yet</h3>
            <p className="text-gray-600 mb-6">Start by posting your first advertisement</p>
            <Link
              href="/post-ad"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Plus size={20} />
              <span>Post Your First Ad</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="easysale-ad-card overflow-hidden">
                <div className="relative">
                  {ad.images && ad.images.length > 0 ? (
                    <img
                      {...getImageProps(getFirstImageUrl(ad.images, ad.category), ad.title)}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black bg-opacity-70 text-white">
                      {ad.views_count} views
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {ad.title}
                      </h3>
                      <p className="text-base font-bold text-[#008299]">
                        {ad.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {ad.location}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {ad.category}
                    </Badge>
                    <span>
                      {new Date(ad.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/ad/${ad.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/edit-ad/${ad.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}