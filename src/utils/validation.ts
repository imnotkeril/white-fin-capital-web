// Validation utilities for White Fin Capital
// Complete rewrite - all functions properly implemented

import { FORM_SETTINGS } from './constants';
import { ValidationSchema } from '@/types'
// Basic email validation
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return FORM_SETTINGS.validation.email.test(email.trim());
}

// Phone number validation
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return FORM_SETTINGS.validation.phone.test(phone.trim());
}

// Name validation (first name, last name)
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= FORM_SETTINGS.maxLengths.name;
}

// Password validation with comprehensive rules
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < FORM_SETTINGS.validation.minPasswordLength) {
    errors.push(`Password must be at least ${FORM_SETTINGS.validation.minPasswordLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Required field validation
export function validateRequired(value: any, fieldName?: string): string | null {
  if (value === null || value === undefined) {
    return `${fieldName || 'Field'} is required`;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName || 'Field'} is required`;
  }

  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName || 'Field'} is required`;
  }

  return null;
}

// String length validation
export function validateLength(
  value: string,
  minLength?: number,
  maxLength?: number,
  fieldName?: string
): string | null {
  if (!value || typeof value !== 'string') return null;

  const length = value.trim().length;

  if (minLength && length < minLength) {
    return `${fieldName || 'Field'} must be at least ${minLength} characters long`;
  }

  if (maxLength && length > maxLength) {
    return `${fieldName || 'Field'} must be no more than ${maxLength} characters long`;
  }

  return null;
}

// URL validation
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Number validation with range checking
export function validateNumber(
  value: any,
  min?: number,
  max?: number,
  fieldName?: string
): string | null {
  if (value === null || value === undefined || value === '') return null;

  const num = Number(value);

  if (isNaN(num)) {
    return `${fieldName || 'Field'} must be a valid number`;
  }

  if (min !== undefined && num < min) {
    return `${fieldName || 'Field'} must be at least ${min}`;
  }

  if (max !== undefined && num > max) {
    return `${fieldName || 'Field'} must be no more than ${max}`;
  }

  return null;
}

// Date validation
export function validateDate(date: any, fieldName?: string): string | null {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return `${fieldName || 'Field'} must be a valid date`;
  }

  return null;
}

// Future date validation
export function validateFutureDate(date: any, fieldName?: string): string | null {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;

  const parsedDate = new Date(date);
  const now = new Date();

  if (parsedDate <= now) {
    return `${fieldName || 'Field'} must be a future date`;
  }

  return null;
}

// Past date validation
export function validatePastDate(date: any, fieldName?: string): string | null {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;

  const parsedDate = new Date(date);
  const now = new Date();

  if (parsedDate >= now) {
    return `${fieldName || 'Field'} must be a past date`;
  }

  return null;
}

// File validation with type and size checking
export function validateFile(
  file: File,
  allowedTypes?: string[],
  maxSize?: number,
  fieldName?: string
): string | null {
  if (!file) {
    return `${fieldName || 'File'} is required`;
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const isAllowed = allowedTypes.some(type =>
      type.startsWith('.') ? type === fileExtension : type === mimeType
    );

    if (!isAllowed) {
      return `${fieldName || 'File'} must be one of: ${allowedTypes.join(', ')}`;
    }
  }

  if (maxSize && file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `${fieldName || 'File'} size must be less than ${maxSizeMB}MB`;
  }

  return null;
}

// Credit card validation using Luhn algorithm
export function validateCreditCard(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;

  // Remove spaces and dashes
  const number = cardNumber.replace(/[\s-]/g, '');

  // Check if all characters are digits
  if (!/^\d+$/.test(number)) return false;

  // Check length (most cards are 13-19 digits)
  if (number.length < 13 || number.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// CVV validation for credit cards
export function validateCVV(cvv: string, cardType?: 'amex' | 'other'): boolean {
  if (!cvv || typeof cvv !== 'string') return false;

  const cleanCVV = cvv.trim();

  if (!/^\d+$/.test(cleanCVV)) return false;

  if (cardType === 'amex') {
    return cleanCVV.length === 4;
  } else {
    return cleanCVV.length === 3;
  }
}

// Postal code validation for different countries
export function validatePostalCode(postalCode: string, countryCode?: string): boolean {
  if (!postalCode || typeof postalCode !== 'string') return false;

  const cleanCode = postalCode.trim().toUpperCase();

  switch (countryCode?.toUpperCase()) {
    case 'US':
      return /^\d{5}(-\d{4})?$/.test(cleanCode);
    case 'CA':
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(cleanCode);
    case 'UK':
    case 'GB':
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(cleanCode);
    case 'DE':
      return /^\d{5}$/.test(cleanCode);
    case 'FR':
      return /^\d{5}$/.test(cleanCode);
    case 'JP':
      return /^\d{3}-\d{4}$/.test(cleanCode);
    case 'AU':
      return /^\d{4}$/.test(cleanCode);
    default:
      // Generic validation - at least 3 characters, alphanumeric
      return /^[A-Z0-9\s-]{3,10}$/.test(cleanCode);
  }
}

// Age validation
export function validateAge(birthDate: string | Date, minAge: number = 18): string | null {
  if (!birthDate) return 'Birth date is required';

  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime())) {
    return 'Invalid birth date';
  }

  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    if (age - 1 < minAge) {
      return `You must be at least ${minAge} years old`;
    }
  } else if (age < minAge) {
    return `You must be at least ${minAge} years old`;
  }

  return null;
}

// Function to compose multiple validators
export function composeValidators<T>(
  ...validators: Array<(value: T) => string | null>
) {
  return (value: T): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}


// Create validator from schema
export function createValidator<T>(schema: ValidationSchema<T>) {
  return (data: T): { [K in keyof T]?: string } => {
    const errors: { [K in keyof T]?: string } = {};

    for (const [field, validators] of Object.entries(schema) as Array<[keyof T, Array<(value: any) => string | null>]>) {
      const value = data[field];

      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for each field
        }
      }
    }

    return errors;
  };
}

// Async validation for unique checks (e.g., email exists)
export async function validateUnique(
  value: string,
  checkFunction: (value: string) => Promise<boolean>,
  fieldName?: string
): Promise<string | null> {
  if (!value) return null;

  try {
    const isUnique = await checkFunction(value);
    if (!isUnique) {
      return `${fieldName || 'Field'} already exists`;
    }
    return null;
  } catch (error) {
    return `Unable to validate ${fieldName || 'field'}`;
  }
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: FORM_SETTINGS.validation.email,
  phone: FORM_SETTINGS.validation.phone,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+\.?\d*$/,
  url: /^https?:\/\/.+/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  creditCard: /^\d{13,19}$/,
  ssn: /^\d{3}-\d{2}-\d{4}$/,
  currency: /^\$?\d+(\.\d{2})?$/,
} as const;

// Helper function to get validation pattern
export function getValidationPattern(patternName: keyof typeof VALIDATION_PATTERNS): RegExp {
  return VALIDATION_PATTERNS[patternName];
}

// Batch validation for multiple fields
export function validateFields<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): { isValid: boolean; errors: { [K in keyof T]?: string } } {
  const validator = createValidator(schema);
  const errors = validator(data);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Export all validation functions and utilities
export default {
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
  validateRequired,
  validateLength,
  validateUrl,
  validateNumber,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateFile,
  validateCreditCard,
  validateCVV,
  validatePostalCode,
  validateAge,
  composeValidators,
  createValidator,
  validateUnique,
  validateFields,
  VALIDATION_PATTERNS,
  getValidationPattern,
};