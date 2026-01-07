import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA: boolean; tempToken?: string }>;
  register: (email: string, password: string) => Promise<void>;
  verifyOTP: (tempToken: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { requires2FA, token: tempToken, user } = response.data;

      if (!requires2FA) {
        // User doesn't have 2FA enabled, set full token
        setToken(tempToken);
        setUser(user);
        localStorage.setItem('token', tempToken);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { requires2FA, tempToken };
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authAPI.register(email, password);
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (tempToken: string, otp: string) => {
    try {
      const response = await authAPI.verifyOTP(tempToken, otp);
      const { accessToken, user } = response.data;

      setToken(accessToken);
      setUser(user);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    verifyOTP,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
