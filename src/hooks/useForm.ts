import { useState, useCallback, useMemo } from 'react';
import { FormState, FormErrors } from '@/types';
import { validateEmail } from '@/utils/validation';

type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  email?: boolean;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: FormErrors) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  resetField: (field: keyof T) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setFormValues] = useState<T>(initialValues);
  const [errors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty (values different from initial)
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => {
      const currentValue = values[key];
      const initialValue = initialValues[key];

      if (typeof currentValue === 'object' && typeof initialValue === 'object') {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }

      return currentValue !== initialValue;
    });
  }, [values, initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate a single field
  const validateField = useCallback((field: keyof T): string | null => {
    const value = values[field];
    const rules = validationRules[field];

    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${String(field)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String-specific validations
    if (typeof value === 'string') {
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return `${String(field)} must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(field)} must be no more than ${rules.maxLength} characters`;
      }

      // Email validation
      if (rules.email && !validateEmail(value)) {
        return `${String(field)} must be a valid email address`;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${String(field)} format is invalid`;
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [values, validationRules]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField, validationRules]);

  // Set field value
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validate on change if enabled
    if (validateOnChange && validationRules[field]) {
      const error = validateField(field);
      setFormErrors(prev => ({
        ...prev,
        [field]: error || undefined,
      }));
    }
  }, [validateOnChange, validationRules, validateField]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setFormValues(prev => ({
      ...prev,
      ...newValues,
    }));

    if (validateOnChange) {
      const newErrors: FormErrors = { ...errors };

      Object.keys(newValues).forEach(field => {
        if (validationRules[field as keyof T]) {
          const error = validateField(field as keyof T);
          newErrors[field] = error || undefined;
        }
      });

      setFormErrors(newErrors);
    }
  }, [validateOnChange, validationRules, validateField, errors]);

  // Set field error
  const setError = useCallback((field: keyof T, error: string) => {
    setFormErrors(prev => ({
      ...prev,
      [field as string]: error,
    }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: FormErrors) => {
    setFormErrors(prev => ({
      ...prev,
      ...newErrors,
    }));
  }, []);

  // Clear field error
  const clearError = useCallback((field: keyof T) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  // Handle field change
  const handleChange = useCallback((field: keyof T) => {
    return (value: T[keyof T]) => {
      setValue(field, value);
    };
  }, [setValue]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouched(prev => ({
        ...prev,
        [field]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur && validationRules[field]) {
        const error = validateField(field);
        setFormErrors(prev => ({
          ...prev,
          [field as string]: error || undefined,
        }));
      }
    };
  }, [validateOnBlur, validationRules, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (isSubmitting) return;

    // Mark all fields as touched
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    // Validate form
    const isFormValid = validateForm();

    if (!isFormValid || !onSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      // You might want to set form-level errors here
    } finally {
      setIsSubmitting(false);
    }
  }, [values, isSubmitting, validateForm, onSubmit, initialValues]);

  // Reset form
  const reset = useCallback(() => {
    setFormValues(initialValues);
    setFormErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Reset single field
  const resetField = useCallback((field: keyof T) => {
    setValue(field, initialValues[field]);
    clearError(field);
    setTouched(prev => ({
      ...prev,
      [field]: false,
    }));
  }, [setValue, clearError, initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
  };
}