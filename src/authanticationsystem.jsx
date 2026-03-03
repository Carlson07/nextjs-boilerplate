// ===============================
// 🔐 ENHANCED AUTHENTICATION SYSTEM
// ===============================

import React, { useState, useEffect } from 'react';
import { UniLinkAPI, verifyToken } from './api.js';

// Authentication Context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('unilink_token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('unilink_token');
      const savedUser = localStorage.getItem('unilink_user');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token validity with backend
          const isValid = await verifyToken(savedToken);
          if (!isValid) {
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await UniLinkAPI.auth.login(email, password);
      
      if (result.success) {
        const { user: userData, token: authToken } = result.data;
        
        setUser(userData);
        setToken(authToken);
        
        localStorage.setItem('unilink_token', authToken);
        localStorage.setItem('unilink_user', JSON.stringify(userData));
        localStorage.setItem('unilink_refresh_token', result.data.refreshToken);
        
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await UniLinkAPI.auth.register(userData);
      
      if (result.success) {
        const { user: newUser, token: authToken } = result.data;
        
        setUser(newUser);
        setToken(authToken);
        
        localStorage.setItem('unilink_token', authToken);
        localStorage.setItem('unilink_user', JSON.stringify(newUser));
        localStorage.setItem('unilink_refresh_token', result.data.refreshToken);
        
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unilink_token');
    localStorage.removeItem('unilink_user');
    localStorage.removeItem('unilink_refresh_token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Enhanced Authentication API
const AuthAPI = {
  login: async (email, password) => {
    const response = await fetch(`${UniLinkAPI.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  
  register: async (userData) => {
    const response = await fetch(`${UniLinkAPI.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  
  verifyEmail: async (token) => {
    const response = await fetch(`${UniLinkAPI.baseURL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    return await response.json();
  },
  
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${UniLinkAPI.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    return await response.json();
  },
  
  resetPassword: async (email) => {
    const response = await fetch(`${UniLinkAPI.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return await response.json();
  }
};