import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const request = useCallback(
    async (method: string, endpoint: string, body?: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const config: any = {
          method,
          url: `${apiUrl}${endpoint}`,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (body) {
          config.data = body;
        }

        const response = await axios(config);
        const result = response.data;

        setData(result);
        options.onSuccess?.(result);
        return { success: true, data: result };
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Request failed';
        setError(errorMsg);
        options.onError?.(errorMsg);

        // Handle unauthorized (token expired)
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          typeof window !== 'undefined' && window.location.reload();
        }

        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, token, options]
  );

  const get = useCallback((endpoint: string) => request('GET', endpoint), [request]);
  const post = useCallback((endpoint: string, body: any) => request('POST', endpoint, body), [request]);
  const put = useCallback((endpoint: string, body: any) => request('PUT', endpoint, body), [request]);
  const del = useCallback((endpoint: string) => request('DELETE', endpoint), [request]);

  return { data, isLoading, error, get, post, put, del, request };
};
