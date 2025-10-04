import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/services/api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);
      
      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'Mutation failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return {
    data,
    loading,
    error,
    mutate,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialPage = 1,
  pageSize = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(pageNum, pageSize);
      
      if (response.success && response.data) {
        setData(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotal(response.pagination.total);
        }
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [apiCall, pageSize]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [goToPage, page]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [goToPage, page]);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    total,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    refetch: () => fetchData(page),
  };
}

// Hook for search functionality
export function useSearch<T>(
  searchFn: (query: string) => Promise<ApiResponse<T[]>>,
  debounceMs = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchFn(query);
        
        if (response.success && response.data) {
          setResults(response.data);
        } else {
          setError(response.error || 'Search failed');
          setResults([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchFn, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => {
      setQuery('');
      setResults([]);
      setError(null);
    },
  };
}

// Hook for real-time data (with polling)
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  intervalMs = 5000,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, intervalMs);

    return () => clearInterval(intervalId);
  }, [fetchData, intervalMs, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for form submissions with validation
export function useFormSubmission<TData, TFormData>(
  submitFn: (formData: TFormData) => Promise<ApiResponse<TData>>,
  onSuccess?: (data: TData) => void,
  onError?: (error: string) => void
) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (formData: TFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await submitFn(formData);
      
      if (response.success && response.data) {
        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.error || 'Submission failed';
        setError(errorMessage);
        onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [submitFn, onSuccess, onError]);

  return {
    submitting,
    error,
    handleSubmit,
    clearError: () => setError(null),
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  updateFn: (id: string, updates: Partial<T>) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimisticUpdate = useCallback(async (
    id: string,
    updates: Partial<T>,
    optimisticData: Partial<T>
  ) => {
    // Apply optimistic update
    const previousData = [...data];
    setData(prev => prev.map(item => 
      (item as any).id === id ? { ...item, ...optimisticData } : item
    ));

    setLoading(true);
    setError(null);

    try {
      const response = await updateFn(id, updates);
      
      if (response.success && response.data) {
        // Apply real update
        setData(prev => prev.map(item => 
          (item as any).id === id ? response.data! : item
        ));
      } else {
        // Revert optimistic update
        setData(previousData);
        const errorMessage = response.error || 'Update failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      // Revert optimistic update
      setData(previousData);
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data, updateFn]);

  return {
    data,
    setData,
    loading,
    error,
    optimisticUpdate,
  };
}