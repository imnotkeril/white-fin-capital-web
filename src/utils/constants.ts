// Constants for White Fin Capital - Simplified Version

// Company Information
export const COMPANY = {
  name: 'White Fin Capital',
  tagline: 'Where Deep Research Meets Financial Markets',
  description: 'Professional financial research and analysis for sophisticated investors',
  email: 'office@whitefincapital.com',
  phone: ' ',
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
  { id: 'pricing', label: 'Sales (“Choose you plan”)', href: '#pricing', section: 'pricing' },
  { id: 'contact', label: 'Get In Touch', href: '#contact', section: 'contact' },
] as const;

// Theme Settings
export const THEME = {
  default: 'dark' as const,
  storageKey: 'white-fin-theme',
  colors: {
    primary: '#90bff9',
    secondary: '#7dd3fc',
    success: '#059669',
    error: '#0369a1',
    warning: '#0891b2',
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

// Form Settings
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
  twitter: 'https://x.com/WhiteFinCapital',
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
  preferences: 'white-fin-preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  fileUpload: 'File upload failed. Please try again.',
  fileFormat: 'Invalid file format. Please upload a CSV file.',
} as const;