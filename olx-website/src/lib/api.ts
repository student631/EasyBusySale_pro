// filepath: d:\olx\olx-website\src\lib\api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Advertisement {
  id: string;
  slug?: string; // SEO-friendly URL slug
  title: string;
  description?: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  condition_type: string;
  contact_phone?: string;
  contact_email?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  location?: string;
  created_at: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || localStorage.getItem('authToken');
    }
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token); // Keep both for compatibility
    }
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add authorization header if token exists
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // fallback for HTML or other responses
      }

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          this.clearToken();
        }

        // Extract error message from response
        let errorMessage = data?.error || data?.message || `HTTP error! status: ${response.status}`;

        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            errorMessage = data?.error || data?.message || 'Invalid request data';
            break;
          case 401:
            errorMessage = data?.error || data?.message || 'Authentication required';
            break;
          case 403:
            errorMessage = data?.error || data?.message || 'Permission denied';
            break;
          case 404:
            errorMessage = data?.error || data?.message || 'Resource not found';
            break;
          case 409:
            errorMessage = data?.error || data?.message || 'Resource already exists';
            break;
          case 500:
            errorMessage = data?.error || data?.message || 'Server error occurred';
            break;
        }

        return {
          success: false,
          error: errorMessage,
        } as ApiResponse<T>;
      }

      // If the backend response already has a success field, return it directly
      // to avoid double-wrapping (backend sends {success:true, data:{...}})
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ApiResponse<T>;
      }

      // Otherwise, wrap the response
      return {
        success: true,
        data,
      } as ApiResponse<T>;
    } catch (error) {
      let errorMessage = 'Network error';

      if (error instanceof Error) {
        // Handle specific network errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      } as ApiResponse<T>;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health');
  }

  // Get all ads with optional search and category
  async getAds(params?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<ApiResponse<Advertisement[]>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('q', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    return this.request(`/api/ads${queryString ? `?${queryString}` : ''}`);
  }

  // Get single ad by ID or slug
  async getAd(idOrSlug: string): Promise<ApiResponse<Advertisement>> {
    return this.request(`/api/ads/${idOrSlug}`);
  }

  // Create new ad (requires authentication)
  async createAd(adData: Omit<Advertisement, 'id' | 'views_count' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Advertisement>> {
    return this.request('/api/ads', {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  }

  // Update ad (requires authentication)
  async updateAd(id: string, adData: Partial<Omit<Advertisement, 'id' | 'views_count' | 'created_at'>>): Promise<ApiResponse<Advertisement>> {
    return this.request(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    });
  }

  // Delete ad (requires authentication)
  async deleteAd(id: string): Promise<ApiResponse> {
    return this.request(`/api/ads/${id}`, {
      method: 'DELETE',
    });
  }

  // Get user's ads (requires authentication)
  async getMyAds(params?: { limit?: number; offset?: number }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    return this.request(`/api/ads/my-ads${queryString ? `?${queryString}` : ''}`);
  }

  // Legacy search ads (backward compatibility)
  async searchAds(query: string, category?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    return this.request(`/api/ads/search?${params.toString()}`);
  }

  // Auth: signup
  async signup(payload: { username: string; email: string; password: string; full_name?: string; phone?: string; location?: string; }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Auto-set token on successful signup
    // Backend returns {success, user, token} directly (no data wrapper)
    if (response.success) {
      const token = (response as any).token;
      if (token) {
        console.log('✅ [API] Setting token after signup:', token.substring(0, 20) + '...');
        this.setToken(token);
      } else {
        console.error('❌ [API] No token found in signup response:', response);
      }
    }

    return response;
  }

  // Auth: login
  async login(payload: { email: string; password: string; }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    // Auto-set token on successful login
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // Logout
  logout(): void {
    this.clearToken();
  }

  // Get current user profile (requires authentication)
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/api/users/profile');
  }

  // Update user profile (requires authentication)
  async updateProfile(profileData: { full_name?: string; phone?: string; location?: string; }): Promise<ApiResponse<User>> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Get public user profile
  async getUserProfile(id: string): Promise<ApiResponse<User>> {
    return this.request(`/api/users/${id}`);
  }

  // Get featured ads
  async getFeaturedAds(limit = 8): Promise<ApiResponse<Advertisement[]>> {
    return this.request(`/api/ads/featured?limit=${limit}`);
  }

  // Get ads by location
  async getAdsByLocation(location: string, params?: { limit?: number; offset?: number }): Promise<ApiResponse<Advertisement[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    return this.request(`/api/ads/location/${location}${queryString ? `?${queryString}` : ''}`);
  }

  // Get categories with counts
  async getCategories(): Promise<ApiResponse<{ category: string; count: number }[]>> {
    return this.request('/api/ads/categories');
  }

  // Get similar ads
  async getSimilarAds(adId: string, limit = 4): Promise<ApiResponse<Advertisement[]>> {
    return this.request(`/api/ads/${adId}/similar?limit=${limit}`);
  }

  // Mark ad as sold
  async markAdAsSold(id: string): Promise<ApiResponse<Advertisement>> {
    return this.request(`/api/ads/${id}/sold`, {
      method: 'POST',
    });
  }

  // Upload files (now works without authentication)
  async uploadFiles(files: File[]): Promise<ApiResponse<{ files: string[] }>> {
    try {
      console.log('Starting upload of', files.length, 'files');
      console.log('Base URL:', this.baseURL);

      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('images', file);
      });

      console.log('FormData entries:', formData.getAll('images').length);

      const response = await fetch(`${this.baseURL}/api/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData - let browser set it with boundary
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      const data = await response.json();
      console.log('Upload response data:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to upload files'
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Batch operations for better performance
  async batchRequest<T>(requests: Array<{ endpoint: string; options?: RequestInit }>): Promise<ApiResponse<T>[]> {
    try {
      const promises = requests.map(({ endpoint, options }) => this.request<T>(endpoint, options));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch request error:', error);
      return requests.map(() => ({
        success: false,
        error: 'Batch request failed'
      }));
    }
  }

  // Add retry logic for failed requests
  async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 3,
    delay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiResponse<T> | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.request<T>(endpoint, options);

        // If successful or client error (4xx), don't retry
        if (response.success || (response.error && !response.error.includes('Network') && !response.error.includes('Server error'))) {
          return response;
        }

        lastError = response;

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      } catch (error) {
        lastError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return lastError || {
      success: false,
      error: 'Max retries exceeded'
    };
  }

  // AI Classification Methods

  // Classify ad content
  async classifyAd(data: { title?: string; description?: string; price?: number }): Promise<ApiResponse<any>> {
    return this.request('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Batch classify multiple ads
  async batchClassifyAds(ads: Array<{ id: string; title: string; description?: string; price?: number }>): Promise<ApiResponse<any[]>> {
    return this.request('/api/ai/classify/batch', {
      method: 'POST',
      body: JSON.stringify({ ads }),
    });
  }

  // Get category keywords for autocomplete
  async getCategoryKeywords(category: string): Promise<ApiResponse<{ category: string; keywords: string[] }>> {
    return this.request(`/api/ai/keywords/${category}`);
  }

  // Get AI available categories
  async getAICategories(): Promise<ApiResponse<{ categories: string[]; total: number }>> {
    return this.request('/api/ai/categories');
  }

  // Smart category suggestion
  async suggestCategory(data: { title?: string; description?: string; price?: number }): Promise<ApiResponse<any>> {
    return this.request('/api/ai/suggest-category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Validate price for category
  async validatePrice(data: { category: string; title?: string; description?: string; price: number }): Promise<ApiResponse<any>> {
    return this.request('/api/ai/validate-price', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Content quality check
  async checkContentQuality(data: { title?: string; description?: string; price?: number; images?: string[] }): Promise<ApiResponse<any>> {
    return this.request('/api/ai/quality-check', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Messaging Methods

  // Get user's conversations
  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request('/api/messages/conversations');
  }

  // Get messages in a conversation
  async getMessages(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/messages/conversations/${conversationId}`);
  }

  // Send a message
  async sendMessage(data: { adId?: string; receiverId?: string; messageText: string; conversationId?: string }): Promise<ApiResponse<any>> {
    return this.request('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Start a new conversation about an ad
  async startConversation(data: { adId: string; messageText: string }): Promise<ApiResponse<any>> {
    console.log('🌐 API Client - startConversation called with:', data);
    console.log('🌐 Stringified body:', JSON.stringify(data));
    return this.request('/api/messages/start-conversation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/messages/mark-read/${conversationId}`, {
      method: 'PUT',
    });
  }

  // Notifications Methods

  // Get notifications
  async getNotifications(params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.unreadOnly) searchParams.append('unreadOnly', params.unreadOnly.toString());

    const queryString = searchParams.toString();
    return this.request(`/api/notifications${queryString ? `?${queryString}` : ''}`);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Stats Methods

  // Get website statistics
  async getStats(): Promise<ApiResponse<any>> {
    return this.request('/api/stats');
  }

  // Google OAuth: authenticate with Google credential
  async googleAuth(credential: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    // Auto-set token on successful Google auth
    if (response.success) {
      const token = (response.data as any)?.token || (response as any).token;
      if (token) {
        console.log('✅ [API] Setting token after Google auth');
        this.setToken(token);
      }
    }

    return response;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);