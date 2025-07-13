// API Types for White Fin Capital

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Contact API Types
export interface ContactRequest {
  firstName: string;
  email: string;
  purpose: string;
  message: string;
  source?: string;
}

export interface ContactResponse {
  id: string;
  status: 'received' | 'processing' | 'responded';
  submittedAt: string;
  estimatedResponseTime: string;
}

// Authentication API Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// Subscription API Types
export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
  billingInterval: 'monthly' | 'yearly';
  promocode?: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string; // For Stripe payment confirmation
  status: 'active' | 'incomplete' | 'trialing';
  currentPeriodEnd: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string;
  feedback?: string;
}

export interface CancelSubscriptionResponse {
  subscriptionId: string;
  status: 'canceled';
  canceledAt: string;
  accessUntil: string;
}

// Statistics API Types
export interface StatisticsRequest {
  period?: 'ytd' | '1y' | '2y' | 'all';
  metric?: 'returns' | 'trades' | 'drawdown';
  format?: 'json' | 'csv';
}

export interface StatisticsResponse {
  period: string;
  data: {
    totalReturn: number;
    winRate: number;
    totalTrades: number;
    maxDrawdown: number;
    sharpeRatio: number;
    chartData: Array<{
      date: string;
      cumulativeReturn: number;
      dailyReturn: number;
    }>;
    monthlyReturns: Array<{
      month: string;
      return: number;
    }>;
  };
  updatedAt: string;
}

export interface UploadCSVRequest {
  file: File;
  type: 'performance' | 'trades' | 'portfolio';
  overwrite?: boolean;
}

export interface UploadCSVResponse {
  fileId: string;
  filename: string;
  rowsProcessed: number;
  summary: {
    validRows: number;
    invalidRows: number;
    warnings: string[];
  };
  uploadedAt: string;
}

// Health Check API Types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    email: 'operational' | 'degraded';
    payment: 'operational' | 'degraded';
    storage: 'operational' | 'degraded';
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    responseTime: number;
  };
}

// Newsletter API Types
export interface NewsletterSubscribeRequest {
  email: string;
  source?: string;
  interests?: string[];
}

export interface NewsletterSubscribeResponse {
  email: string;
  status: 'subscribed' | 'confirmed' | 'pending';
  subscribedAt: string;
}

export interface NewsletterUnsubscribeRequest {
  email: string;
  token?: string;
}

export interface NewsletterUnsubscribeResponse {
  email: string;
  status: 'unsubscribed';
  unsubscribedAt: string;
}

// Payment Webhook Types
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: any;
  create_time: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}