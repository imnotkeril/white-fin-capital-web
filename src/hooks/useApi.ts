import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiResponse, ApiError } from '@/types/api';
import { apiService } from '@/services/api';
import { useNotifications } from '@/context/AppContext';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

interface UseApiOptions {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    showErrorNotification = true,
    showSuccessNotification = false,
    successMessage,
    errorMessage,
    retryCount = 0,
    retryDelay = 1000,
    timeout = 30000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const { notifyError, notifySuccess } = useNotifications();
  const lastArgsRef = useRef<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const executeRequest = useCallback(async (
    args: any[],
    currentRetry = 0
  ): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      // Add timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeout);
      });

      // Execute API call with timeout
      const apiPromise = apiFunction(...args);
      const response = await Promise.race([apiPromise, timeoutPromise]);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      if (response.success && response.data !== undefined) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true,
        });

        if (showSuccessNotification && successMessage) {
          notifySuccess('Success', successMessage);
        }

        return response.data;
      } else {
        throw new Error(response.message || 'API request failed');
      }
    } catch (error: any) {
      // Don't process aborted requests
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        statusCode: error.statusCode || 500,
        details: error.details,
        timestamp: new Date().toISOString(),
      };

      // Retry logic
      if (currentRetry < retryCount && !isNonRetryableError(apiError)) {
        retryTimeoutRef.current = setTimeout(() => {
          executeRequest(args, currentRetry + 1);
        }, retryDelay * Math.pow(2, currentRetry)); // Exponential backoff

        return null;
      }

      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });

      if (showErrorNotification) {
        const message = errorMessage || apiError.message;
        notifyError('Error', message);
      }

      throw apiError;
    }
  }, [
    apiFunction,
    timeout,
    retryCount,
    retryDelay,
    showErrorNotification,
    showSuccessNotification,
    successMessage,
    errorMessage,
    notifyError,
    notifySuccess,
  ]);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    lastArgsRef.current = args;
    return executeRequest(args);
  }, [executeRequest]);

  const retry = useCallback(async (): Promise<T | null> => {
    return executeRequest(lastArgsRef.current);
  }, [executeRequest]);

  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
}

// Helper function to determine if an error should not be retried
function isNonRetryableError(error: ApiError): boolean {
  // Don't retry client errors (4xx) except for specific cases
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    // Retry on rate limiting or temporary client errors
    return ![408, 429, 503, 504].includes(error.statusCode || 0);
  }

  // Retry server errors (5xx)
  return false;
}

// Specialized hooks for common API patterns

export function useApiQuery<T>(
  queryFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions & {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchInterval,
    ...apiOptions
  } = options;

  const api = useApi(queryFunction, apiOptions);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (enabled && refetchOnMount) {
      api.execute();
    }
  }, [enabled, refetchOnMount]); // eslint-disable-line

  // Set up refetch interval
  useEffect(() => {
    if (enabled && refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (!api.loading) {
          api.execute();
        }
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    return undefined;
  }, [enabled, refetchInterval, api.loading]);

  const refetch = useCallback(() => {
    return api.execute();
  }, [api.execute]);

  return {
    ...api,
    refetch,
    isRefetching: api.loading,
  };
}

export function useApiMutation<T, TVariables = any>(
  mutationFunction: (variables: TVariables) => Promise<ApiResponse<T>>,
  options: UseApiOptions & {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  } = {}
) {
  const { onSuccess, onError, ...apiOptions } = options;
  const api = useApi(mutationFunction, apiOptions);

  const mutate = useCallback(async (variables: TVariables): Promise<T | null> => {
    try {
      const result = await api.execute(variables);
      if (result && onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      if (onError) {
        onError(error as ApiError);
      }
      throw error;
    }
  }, [api.execute, onSuccess, onError]);

  return {
    ...api,
    mutate,
    mutateAsync: mutate,
    isLoading: api.loading,
    isSuccess: api.success,
    isError: !!api.error,
  };
}