// Constants for White Fin Capital

// Company Information
export const COMPANY = {
  name: 'White Fin Capital',
  tagline: 'Where Deep Research Meets Financial Markets',
  description: 'Professional financial research and analysis for sophisticated investors',
  email: 'info@whitefincapital.com',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Financial District',
    city: 'New York',
    state: 'NY',
    zip: '10004',
    country: 'United States',
  },
} as const;

// Navigation
export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', href: '#home', section: 'hero' },
  { id: 'performance', label: 'Performance', href: '#performance', section: 'performance' },
  { id: 'services', label: 'Services', href: '#services', section: 'services' },
  { id: 'team', label: 'Team', href: '#team', section: 'team' },
  { id: 'pricing', label: 'Pricing', href: '#pricing', section: 'subscription' },
  { id: 'contact', label: 'Contact', href: '#contact', section: 'contact' },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  contact: '/api/contact',
  subscribe: '/api/subscribe',
  statistics: '/api/statistics',
  uploadCsv: '/api/statistics/upload-csv',
  health: '/api/health',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
  },
  subscription: {
    create: '/api/subscription/create',
    cancel: '/api/subscription/cancel',
    webhook: '/api/subscription/webhook',
  },
} as const;

// Theme Settings
export const THEME = {
  default: 'dark' as const,
  storageKey: 'white-fin-theme',
  colors: {
    primary: '#90bff9',
    secondary: '#7dd3fc',
    success: '#059669',
    error: '#0369a1', // Ocean blue instead of red
    warning: '#0891b2', // Ocean teal instead of yellow
    neutral: '#64748b',
  },
} as const;

// Animation Settings
export const ANIMATIONS = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
  },
} as const;

// Form Settings - COMPLETE
export const FORM_SETTINGS = {
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    minPasswordLength: 8,
  },
  maxLengths: {
    name: 100,
    email: 255,
    message: 1000,
    subject: 200,
  },
} as const;

// Chart Settings
export const CHART_SETTINGS = {
  colors: {
    primary: '#90bff9',
    secondary: '#7dd3fc',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    neutral: '#6b7280',
  },
  animation: {
    duration: 1000,
    easing: 'easeInOut',
  },
} as const;

// Pagination
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// File Upload
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    csv: ['.csv', 'text/csv'],
    image: ['.jpg', '.jpeg', '.png', '.webp'],
    document: ['.pdf', '.doc', '.docx'],
  },
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  linkedin: 'https://linkedin.com/company/whitefincapital',
  twitter: 'https://twitter.com/whitefincapital',
  telegram: 'https://t.me/whitefincapital',
  youtube: 'https://youtube.com/@whitefincapital',
  instagram: 'https://instagram.com/whitefincapital',
} as const;

// Contact Purposes
export const CONTACT_PURPOSES = [
  'General Inquiry',
  'Partnership Opportunity',
  'Investment Consultation',
  'Technical Support',
  'Media Request',
  'Other',
] as const;

// Performance Metrics
export const PERFORMANCE_METRICS = {
  targetReturn: 20, // 20% annual return
  targetWinRate: 65, // 65% win rate
  maxDrawdown: -15, // Maximum 15% drawdown
  minSharpeRatio: 1.5, // Minimum Sharpe ratio
} as const;

// Subscription Features
export const SUBSCRIPTION_FEATURES = {
  basic: [
    'Weekly Market Analysis',
    'Monthly Performance Reports',
    'Email Support',
    'Basic Research Access',
  ],
  professional: [
    'Real-time Trade Alerts',
    'Daily Market Updates',
    'Advanced Research Reports',
    'Video Analysis',
    'Priority Support',
    'Risk Management Tools',
  ],
  enterprise: [
    'Custom Research Projects',
    'Direct Analyst Access',
    'Institutional Reports',
    'API Access',
    'Dedicated Account Manager',
    'Custom Integration Support',
  ],
} as const;

// Breakpoints (must match Tailwind config)
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1680,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'white-fin-theme',
  user: 'white-fin-user',
  preferences: 'white-fin-preferences',
  cart: 'white-fin-cart',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to access this resource.',
  notFound: 'The requested resource was not found.',
  rateLimit: 'Too many requests. Please try again later.',
  payment: 'Payment processing failed. Please try again.',
  subscription: 'Subscription error. Please contact support.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  contactSubmitted: 'Your message has been sent successfully. We\'ll get back to you soon.',
  subscriptionCreated: 'Welcome! Your subscription has been activated.',
  subscriptionCanceled: 'Your subscription has been canceled successfully.',
  profileUpdated: 'Your profile has been updated successfully.',
  passwordChanged: 'Your password has been changed successfully.',
} as const;