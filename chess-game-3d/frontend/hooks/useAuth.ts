import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  rating: number;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
  };
  friends: string[];
  friendRequests: Array<{
    from: string;
    username: string;
    status: 'pending' | 'accepted';
  }>;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!username || username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const response = await axios.post(`${apiUrl}/api/auth/register`, {
          username,
          email,
          password
        });

        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!email || !email.includes('@')) {
          throw new Error('Invalid email address');
        }
        if (!password) {
          throw new Error('Password is required');
        }

        const response = await axios.post(`${apiUrl}/api/auth/login`, {
          email,
          password
        });

        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout
  };
};
