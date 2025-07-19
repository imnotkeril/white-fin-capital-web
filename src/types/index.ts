// Main types for White Fin Capital - Cleaned Version

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
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
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

// Statistics and Trading Types
export interface Statistics {
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  averageGain: number;
  averageLoss: number;
  period: string;
  lastUpdated: Date;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  return: number;
  entryDate: string;
  closedAt: string;
}

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
  originalPrice?: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

// Service Types
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: ServiceFeature[];
}

export interface ServiceFeature {
  title: string;
  description: string;
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

// Modal Types
export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// File Upload Props Types
export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  onError?: (error: string) => void;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  success?: boolean;
}

// Generic Response Types (for local data handling)
export interface DataResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Performance Statistics Types
export interface PerformanceStats {
  totalReturn: number;
  annualizedReturn: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  startDate: string;
  endDate: string;
  lastUpdated: string;
}

// Validation Schema Type
export type ValidationSchema<T> = {
  [K in keyof T]?: Array<(value: T[K]) => string | null>;
};