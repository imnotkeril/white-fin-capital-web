// API Service for White Fin Capital

import { ApiResponse, ApiError, ApiRequest } from '@/types/api';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/utils/constants';

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Generic request method
  private async request<T = any>(config: ApiRequest): Promise<ApiResponse<T>> {
    const { method, url, data, headers = {} } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add CSRF token for mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        requestHeaders['X-CSRF-Token'] = csrfToken;
      }
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Include cookies for authentication
    };

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // For file uploads, remove Content-Type to let browser set it
        delete requestHeaders['Content-Type'];
        requestConfig.body = data;
      } else {
        requestConfig.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(fullUrl, requestConfig);

      // Handle different response types
      let responseData;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle HTTP errors
      if (!response.ok) {
        const error: ApiError = {
          code: responseData?.code || `HTTP_${response.status}`,
          message: responseData?.message || this.getErrorMessage(response.status),
          statusCode: response.status,
          details: responseData?.details,
        };

        throw error;
      }

      // Return success response
      return {
        success: true,
        data: responseData?.data ?? responseData,
        message: responseData?.message,
      };

    } catch (error: any) {
      // Network or parsing errors
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw {
          code: 'NETWORK_ERROR',
          message: ERROR_MESSAGES.network,
          statusCode: 0,
        } as ApiError;
      }

      // Re-throw API errors
      if (error.statusCode) {
        throw error;
      }

      // Unknown errors
      throw {
        code: 'UNKNOWN_ERROR',
        message: error.message || ERROR_MESSAGES.server,
        statusCode: 500,
      } as ApiError;
    }
  }

  // GET request
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, headers });
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, headers });
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, headers });
  }

  // PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, headers });
  }

  // DELETE request
  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }

  // Upload file
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
    });
  }

  // Get CSRF token from meta tag or cookie
  private getCSRFToken(): string | null {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Try to get from cookie
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Get error message based on status code
  private getErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return ERROR_MESSAGES.validation;
      case 401:
        return ERROR_MESSAGES.unauthorized;
      case 403:
        return 'Access forbidden. You do not have permission to access this resource.';
      case 404:
        return ERROR_MESSAGES.notFound;
      case 429:
        return ERROR_MESSAGES.rateLimit;
      case 500:
        return ERROR_MESSAGES.server;
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The request took too long to complete.';
      default:
        return ERROR_MESSAGES.server;
    }
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Specific API methods for White Fin Capital

// Contact API
export const contactAPI = {
  sendMessage: (data: {
    firstName: string;
    email: string;
    purpose: string;
    message: string;
  }) => apiService.post(API_ENDPOINTS.contact, data),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => apiService.get(API_ENDPOINTS.subscribe),

  createSubscription: (data: {
    planId: string;
    email: string;
    paymentMethodId: string;
    billingDetails: any;
  }) => apiService.post(API_ENDPOINTS.subscription.create, data),

  cancelSubscription: (subscriptionId: string, reason?: string) =>
    apiService.post(API_ENDPOINTS.subscription.cancel, { subscriptionId, reason }),
};

// Statistics API
export const statisticsAPI = {
  getPerformance: (period?: string) =>
    apiService.get(`${API_ENDPOINTS.statistics}${period ? `?period=${period}` : ''}`),

  uploadCSV: (file: File, type: string) =>
    apiService.uploadFile(API_ENDPOINTS.uploadCsv, file, { type }),
};

// Health check API
export const healthAPI = {
  check: () => apiService.get(API_ENDPOINTS.health),
};

// Authentication API (if needed)
export const authAPI = {
  login: (email: string, password: string) =>
    apiService.post(API_ENDPOINTS.auth.login, { email, password }),

  register: (userData: any) =>
    apiService.post(API_ENDPOINTS.auth.register, userData),

  refreshToken: (refreshToken: string) =>
    apiService.post(API_ENDPOINTS.auth.refresh, { refreshToken }),

  logout: () => apiService.post('/api/auth/logout'),
};

// Request interceptor for token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Auto-retry with token refresh for 401 errors
export async function apiWithRetry<T>(apiCall: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.statusCode === 401 && !isRefreshing) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        isRefreshing = true;

        try {
          const response = await authAPI.refreshToken(refreshToken);
          const newToken = response.data?.token;

          if (newToken) {
            apiService.setAuthToken(newToken);
            localStorage.setItem('token', newToken);
            onTokenRefreshed(newToken);
            isRefreshing = false;

            // Retry original request
            return await apiCall();
          }
        } catch (refreshError) {
          isRefreshing = false;
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw refreshError;
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }

    throw error;
  }
}