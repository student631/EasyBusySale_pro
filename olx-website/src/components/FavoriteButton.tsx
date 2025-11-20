'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FavoriteButtonProps {
  adId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'outline' | 'ghost' | 'default';
}

export default function FavoriteButton({
  adId,
  className = '',
  size = 'sm',
  variant = 'outline'
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if ad is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !adId) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/favorites/check/${adId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsFavorite(data.isFavorite);
          }
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, adId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to save favorites');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/api/favorites/${adId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const errorData = await response.json();
        if (response.status === 409 && errorData.error?.includes('already in favorites')) {
          setIsFavorite(true);
        } else {
          alert('Failed to update favorites. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`${isFavorite ? 'text-red-500 border-red-500' : ''} ${className}`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''} ${loading ? 'animate-pulse' : ''}`} />
    </Button>
  );
}