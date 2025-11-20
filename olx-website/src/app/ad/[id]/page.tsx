'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, MessageSquare, Phone, Mail, MapPin, Calendar, Eye, Star, Shield, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getImageProps, getFirstImageUrl, getCategoryDefaultImage } from '@/lib/imageUtils';
import FavoriteButton from '@/components/FavoriteButton';
import { apiClient } from '@/lib/api';

interface AdDetails {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  location: string;
  images: string[];
  condition_type: string;
  contact_phone?: string;
  contact_email?: string;
  seller_name?: string;
  seller_location?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface RelatedAd {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  images: string[];
}

export default function AdDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const adId = params.id as string;
  const [ad, setAd] = useState<AdDetails | null>(null);
  const [relatedAds, setRelatedAds] = useState<RelatedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const response = await apiClient.getAd(adId);
        console.log('getAd response:', response);

        if (response.success && response.data) {
          // Handle both response formats:
          // 1. Direct ad object: response.data (when API client doesn't wrap)
          // 2. Wrapped in 'ad' property: response.data.ad (when backend wraps)
          const adData = (response.data as any).ad || response.data;

          console.log('📋 Extracted adData:', adData);
          console.log('📋 adData.id:', adData?.id);

          if (adData) {
            // Ensure images is always an array and ID is preserved
            const finalAdData = {
              ...adData,
              id: adData.id || adId, // Fallback to URL parameter if id is missing
              images: adData.images || []
            };
            console.log('✅ Final ad data being set:', finalAdData);
            console.log('✅ Final ad ID:', finalAdData.id);
            setAd(finalAdData);

            // Fetch related ads in the same category
            const relatedResponse = await apiClient.getAds({
              category: adData.category,
              limit: 4
            });

            if (relatedResponse.success && relatedResponse.data) {
              const adsArray = (relatedResponse.data as any).ads || relatedResponse.data;
              if (Array.isArray(adsArray)) {
                const filtered = adsArray.filter((relatedAd: any) => relatedAd.id !== adId);
                setRelatedAds(filtered.slice(0, 3));
              }
            }
          } else {
            throw new Error('Ad not found');
          }
        } else {
          throw new Error('Ad not found');
        }
      } catch (err) {
        console.error('Error fetching ad details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (adId) {
      fetchAdDetails();
    }
  }, [adId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad?.title,
          text: `Check out this ${ad?.category} - ${ad?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendMessage = async () => {
    console.log('🔍 Debug - Full ad object:', ad);
    console.log('🔍 Debug - ad.id:', ad?.id, 'Type:', typeof ad?.id);

    if (!messageText.trim() || !ad || sendingMessage) {
      console.log('❌ Early return - validation failed');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (!ad.id) {
      console.error('❌ CRITICAL: ad.id is missing!', ad);
      alert('Error: Cannot send message - Ad ID is missing. Please refresh the page.');
      return;
    }

    try {
      setSendingMessage(true);

      console.log('📤 Sending message with data:', {
        adId: ad.id,
        messageText: messageText.trim(),
        adObject: ad
      });

      const response = await apiClient.startConversation({
        adId: ad.id,
        messageText: messageText.trim()
      });

      console.log('📥 Response:', response);

      if (response.success) {
        setShowMessageDialog(false);
        setMessageText('');
        // Redirect to messages page
        router.push('/messages');
      } else {
        alert('Failed to send message: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ad details...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Ad Not Found</h1>
          <p className="text-gray-600 mb-6">The ad you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayImages = ad.images && ad.images.length > 0 ? ad.images : [getCategoryDefaultImage(ad.category)];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Main Image */}
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      {...getImageProps(displayImages[currentImageIndex], ad.title)}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Navigation */}
                  {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-2 bg-black/50 rounded-full px-4 py-2">
                        {displayImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {displayImages.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2 overflow-x-auto">
                      {displayImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            {...getImageProps(image, `${ad.title} - Image ${index + 1}`)}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ad Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{ad.category}</Badge>
                      <Badge variant="outline" className="capitalize">{ad.condition_type}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                    <div className="text-4xl font-bold text-blue-600 mb-4">{ad.price}</div>
                  </div>

                  <div className="flex space-x-2">
                    <FavoriteButton
                      adId={adId}
                      variant="outline"
                      size="sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                </div>

                {/* Ad Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <MapPin className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{ad.location}</div>
                    <div className="text-xs text-gray-500">Location</div>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{formatDate(ad.created_at)}</div>
                    <div className="text-xs text-gray-500">Posted</div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{ad.views_count}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <Shield className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">Verified</div>
                    <div className="text-xs text-gray-500">Seller</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Seller */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Seller</h3>

                {/* Seller Info */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {ad.seller_name ? ad.seller_name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {ad.seller_name || 'Seller'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ad.seller_location || ad.location}
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="space-y-3">
                  <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Message to Seller</DialogTitle>
                        <DialogDescription>
                          Send a message to inquire about this item
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">{ad?.title}</p>
                          <p className="text-sm text-gray-600">{ad?.price}</p>
                        </div>
                        <div>
                          <Textarea
                            placeholder="Hi, I'm interested in this item. Is it still available?"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() || sendingMessage}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            {sendingMessage ? 'Sending...' : 'Send Message'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowMessageDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {ad.contact_phone && (
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {ad.contact_phone}
                    </Button>
                  )}

                  {ad.contact_email && (
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Seller
                    </Button>
                  )}
                </div>

                {/* Safety Tips */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium text-sm">Safety Tips</span>
                  </div>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Meet in a public place</li>
                    <li>• Check the item before payment</li>
                    <li>• Don't send money in advance</li>
                    <li>• Trust your instincts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Related Ads */}
            {relatedAds && relatedAds.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Ads</h3>
                  <div className="space-y-4">
                    {relatedAds.map((relatedAd) => (
                      <Link key={relatedAd.id} href={`/ad/${relatedAd.id}`}>
                        <div className="flex space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              {...getImageProps(getFirstImageUrl(relatedAd.images, relatedAd.category), relatedAd.title)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{relatedAd.title}</h4>
                            <p className="text-sm font-bold text-blue-600">{relatedAd.price}</p>
                            <p className="text-xs text-gray-500">{relatedAd.location}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}