/**
 * Utility functions for error handling
 */

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const err = error as any;
    
    // API error response
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    if (err.response?.data?.error) {
      return err.response.data.error;
    }

    // Validation errors
    if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
      return err.response.data.errors.map((e: any) => e.message || e.msg).join(', ');
    }

    if (err.message) {
      return err.message;
    }
  }

  return 'Ha ocurrido un error inesperado';
};

/**
 * Log error to console in development
 */
export const logError = (error: unknown, context?: string): void => {
  if ((import.meta as any).env?.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 400 || error?.response?.status === 422;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: any) => {
      const field = err.field || err.param || 'general';
      const message = err.message || err.msg || 'Error de validación';
      errors[field] = message;
    });
  }

  return errors;
};
