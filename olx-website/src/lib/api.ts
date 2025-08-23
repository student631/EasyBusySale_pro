const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data && (data.message || data.error)) || `HTTP error! status: ${response.status}`,
        } as ApiResponse<T>;
      }

      return {
        success: true,
        data,
      } as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      } as ApiResponse<T>;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health');
  }

  // Get all ads
  async getAds(): Promise<ApiResponse<any[]>> {
    return this.request('/api/ads');
  }

  // Get single ad
  async getAd(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/ads/${id}`);
  }

  // Create new ad
  async createAd(adData: any): Promise<ApiResponse<any>> {
    return this.request('/api/ads', {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  }

  // Update ad
  async updateAd(id: string, adData: any): Promise<ApiResponse<any>> {
    return this.request(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    });
  }

  // Delete ad
  async deleteAd(id: string): Promise<ApiResponse> {
    return this.request(`/api/ads/${id}`, {
      method: 'DELETE',
    });
  }

  // Search ads
  async searchAds(query: string, category?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    return this.request(`/api/ads/search?${params.toString()}`);
  }

  // Auth: signup
  async signup(payload: { username: string; email: string; password: string; full_name?: string; phone?: string; location?: string; }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Auth: login
  async login(payload: { email: string; password: string; }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
