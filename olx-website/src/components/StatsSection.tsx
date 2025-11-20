'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, MapPin, Clock, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface StatsData {
  activeListings: number;
  happyUsers: number;
  cities: number;
  totalViews: number;
  supportHours: string;
}

interface StatItemProps {
  icon: React.ComponentType<any>;
  value: number;
  label: string;
  suffix?: string;
}

// Counter animation component
function CounterAnimation({ targetValue, duration = 2000, suffix = '' }: { targetValue: number; duration?: number; suffix?: string }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = Math.floor(targetValue * easeOutQuart);

      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    updateValue();
  }, [targetValue, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${suffix}`;
    }
    return `${num}${suffix}`;
  };

  return <span>{formatNumber(currentValue)}</span>;
}

// Individual stat item component
function StatItem({ icon: Icon, value, label, suffix = '' }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        <Icon className="h-6 w-6 text-orange-400 mr-2" />
        <div className="text-3xl font-bold text-white">
          <CounterAnimation targetValue={value} suffix={suffix} />
        </div>
      </div>
      <div className="text-blue-200 text-sm">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getStats();

        if (response.success && response.data) {
          // Handle multiple possible response structures
          let statsData = null;

          // Check if data has stats property (nested)
          if ((response.data as any).stats) {
            statsData = (response.data as any).stats;
          }
          // Check if data.data has stats (double nested)
          else if ((response.data as any).data?.stats) {
            statsData = (response.data as any).data.stats;
          }
          // Check if response.data itself is the stats object
          else if ((response.data as any).activeListings !== undefined) {
            statsData = response.data;
          }

          if (statsData) {
            const cleanedStats: StatsData = {
              activeListings: Number(statsData.activeListings) || 0,
              happyUsers: Number(statsData.happyUsers) || 0,
              cities: Number(statsData.cities) || 0,
              totalViews: Number(statsData.totalViews) || 0,
              supportHours: statsData.supportHours || '24/7'
            };
            setStats(cleanedStats);
          } else {
            throw new Error('Stats data not found in response');
          }
        } else {
          throw new Error(response.error || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(true);
        // Show fallback stats
        setStats({
          activeListings: 0,
          happyUsers: 0,
          cities: 0,
          totalViews: 0,
          supportHours: '24/7'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="text-3xl font-bold mb-2 bg-white/20 rounded h-8 w-16 mx-auto"></div>
            <div className="text-blue-200 bg-white/10 rounded h-4 w-20 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      <StatItem
        icon={TrendingUp}
        value={stats.activeListings}
        label="Active Listings"
        suffix="+"
      />
      <StatItem
        icon={Users}
        value={stats.happyUsers}
        label="Happy Users"
        suffix="+"
      />
      <StatItem
        icon={MapPin}
        value={stats.cities}
        label="Cities"
        suffix="+"
      />
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Clock className="h-6 w-6 text-orange-400 mr-2" />
          <div className="text-3xl font-bold text-white">{stats.supportHours}</div>
        </div>
        <div className="text-blue-200 text-sm">Support</div>
      </div>
    </div>
  );
}