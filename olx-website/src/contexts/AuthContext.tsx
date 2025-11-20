'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { username: string; email: string; password: string; full_name?: string; phone?: string; location?: string; }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            apiClient.logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          apiClient.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });

      if (response.success) {
        // Backend returns either:
        // 1. {success: true, data: {user, token}} (wrapped)
        // 2. {success: true, user, token} (direct)
        const userData = (response.data as any)?.user || (response as any).user;
        const token = (response.data as any)?.token || (response as any).token;

        if (userData && token) {
          setUser(userData);
          return { success: true };
        } else {
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        // Handle error response
        const errorMessage = response.error || (response as any).message || 'Login failed';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (data: { username: string; email: string; password: string; full_name?: string; phone?: string; location?: string; }) => {
    try {
      console.log('🔐 [AuthContext] Starting signup...');
      const response = await apiClient.signup(data);
      console.log('🔐 [AuthContext] Signup response:', response);

      if (response.success) {
        // Backend returns either:
        // 1. {success: true, data: {user, token}} (wrapped)
        // 2. {success: true, user, token} (direct)
        const userData = (response.data as any)?.user || (response as any).user;
        const token = (response.data as any)?.token || (response as any).token;

        console.log('🔐 [AuthContext] Extracted user:', userData);
        console.log('🔐 [AuthContext] Extracted token:', token ? token.substring(0, 20) + '...' : 'NONE');

        if (userData && token) {
          setUser(userData);
          console.log('✅ [AuthContext] User set successfully');
          return { success: true };
        } else {
          console.error('❌ [AuthContext] Missing user or token in response');
          return { success: false, error: 'Invalid response from server' };
        }
      } else {
        // Handle error response
        const errorMessage = response.error || (response as any).message || 'Signup failed';
        console.error('❌ [AuthContext] Signup failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ [AuthContext] Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token: apiClient.getToken(),
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}