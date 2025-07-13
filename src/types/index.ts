// Main types for White Fin Capital

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'analyst';
  subscriptionPlan?: 'basic' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'canceled';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: Theme;
  notifications: {
    email: boolean;
    browser: boolean;
    trades: boolean;
    reports: boolean;
  };
  timezone: string;
  language: string;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Component Props Types
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends ComponentProps {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface KPIData {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: 'currency' | 'percentage' | 'number';
}

// Theme Context Types
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// App Context Types
export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  section?: string;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
}

// Statistics Types
export interface StatisticData {
  id: string;
  date: string;
  totalReturn: number;
  winRate: number;
  trades: number;
  drawdown: number;
  sharpeRatio: number;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entry: number;
  exit: number;
  quantity: number;
  profit: number;
  percentage: number;
  date: string;
  duration: string;
  status: 'open' | 'closed' | 'partial';
}

// Team Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  education: string[];
  experience: string[];
  linkedin?: string;
  twitter?: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  badge?: string;
}

// Contact Form Types
export interface ContactFormData {
  firstName: string;
  email: string;
  purpose: string;
  message: string;
}

// Newsletter Form Types
export interface NewsletterFormData {
  email: string;
}

// Subscription Form Types
export interface SubscriptionFormData {
  planId: string;
  paymentMethod: 'stripe' | 'paypal';
  billingInterval: 'monthly' | 'yearly';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// CSV Data Types
export interface CSVData {
  headers: string[];
  rows: string[][];
  metadata: {
    filename: string;
    size: number;
    rowCount: number;
    uploadedAt: string;
  };
}