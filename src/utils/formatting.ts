// Formatting utilities for White Fin Capital

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

// Percentage formatting
export function formatPercentage(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    return `${value.toFixed(decimals)}%`;
  }
}

// Number formatting with commas
export function formatNumber(
  value: number,
  decimals?: number,
  locale: string = 'en-US'
): string {
  try {
    const options: Intl.NumberFormatOptions = {};

    if (decimals !== undefined) {
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
    }

    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    return decimals !== undefined ? value.toFixed(decimals) : value.toString();
  }
}

// Compact number formatting (1K, 1M, 1B)
export function formatCompactNumber(
  value: number,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  } catch (error) {
    // Fallback
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toString();
  }
}

// Date formatting
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: format,
    }).format(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
}

// Time formatting
export function formatTime(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'short',
  locale: string = 'en-US'
): string {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    return new Intl.DateTimeFormat(locale, {
      timeStyle: format,
    }).format(dateObj);
  } catch (error) {
    return 'Invalid Time';
  }
}

// DateTime formatting
export function formatDateTime(
  date: Date | string | number,
  dateFormat: 'short' | 'medium' | 'long' = 'medium',
  timeFormat: 'short' | 'medium' | 'long' = 'short',
  locale: string = 'en-US'
): string {
  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid DateTime';
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: dateFormat,
      timeStyle: timeFormat,
    }).format(dateObj);
  } catch (error) {
    return 'Invalid DateTime';
  }
}

// Relative time formatting (e.g., "2 hours ago")
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    // Use Intl.RelativeTimeFormat if available
    if ('RelativeTimeFormat' in Intl) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

      const units: Array<[string, number]> = [
        ['year', 31536000],
        ['month', 2628000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ];

      for (const [unit, secondsInUnit] of units) {
        const amount = Math.floor(diffInSeconds / secondsInUnit);
        if (Math.abs(amount) >= 1) {
          return rtf.format(-amount, unit as Intl.RelativeTimeFormatUnit);
        }
      }

      return rtf.format(0, 'second');
    }

    // Fallback implementation
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2628000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2628000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;

  } catch (error) {
    return 'Invalid Date';
  }
}

// Phone number formatting
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string = 'US'
): string {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  switch (countryCode.toUpperCase()) {
    case 'US':
    case 'CA':
      if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      if (digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }
      break;
    default:
      // Generic international format
      if (digits.length > 7) {
        return `+${digits}`;
      }
  }

  return phoneNumber; // Return original if we can't format it
}

// File size formatting
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Name formatting
export function formatName(firstName: string, lastName?: string, format: 'full' | 'initials' | 'first' = 'full'): string {
  if (!firstName) return '';

  switch (format) {
    case 'initials':
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;

    case 'first':
      return firstName;

    case 'full':
    default:
      return lastName ? `${firstName} ${lastName}` : firstName;
  }
}

// Credit card number formatting
export function formatCreditCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';

  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');

  // Add spaces every 4 digits
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Text truncation
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;

  return text.slice(0, maxLength - suffix.length) + suffix;
}

// URL formatting
export function formatUrl(url: string): string {
  if (!url) return '';

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  return url;
}

// Remove protocol from URL for display
export function displayUrl(url: string): string {
  if (!url) return '';

  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// Capitalize first letter
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Title case formatting
export function toTitleCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Camel case to readable text
export function camelCaseToReadable(text: string): string {
  if (!text) return '';

  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Format performance indicators with color coding
export function formatPerformanceValue(
  value: number,
  format: 'currency' | 'percentage' | 'number' = 'percentage'
): {
  formatted: string;
  color: 'success' | 'error' | 'neutral';
} {
  let formatted: string;

  switch (format) {
    case 'currency':
      formatted = formatCurrency(value);
      break;
    case 'percentage':
      formatted = formatPercentage(value);
      break;
    case 'number':
      formatted = formatNumber(value, 2);
      break;
  }

  const color = value > 0 ? 'success' : value < 0 ? 'error' : 'neutral';

  return { formatted, color };
}

// Format trading statistics
export function formatTradingStats(stats: {
  totalReturn: number;
  winRate: number;
  totalTrades: number;
  averageGain: number;
  averageLoss: number;
}) {
  return {
    totalReturn: formatPerformanceValue(stats.totalReturn, 'percentage'),
    winRate: formatPerformanceValue(stats.winRate, 'percentage'),
    totalTrades: formatNumber(stats.totalTrades, 0),
    averageGain: formatPerformanceValue(stats.averageGain, 'percentage'),
    averageLoss: formatPerformanceValue(stats.averageLoss, 'percentage'),
  };
}