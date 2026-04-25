/**
 * Authentication Context
 * Provides authentication state and methods to all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          const storedUser = localStorage.getItem('user');
          const stored = storedUser ? JSON.parse(storedUser) : null;
          const mergedUser = {
            ...currentUser,
            name: currentUser.pharmacyName || currentUser.name || stored?.name || null,
            role: currentUser.role || stored?.role || null,
            phone: currentUser.phone || stored?.phone || null,
            latitude: currentUser.latitude || stored?.latitude || null,
            longitude: currentUser.longitude || stored?.longitude || null,
            operatingHours: currentUser.operatingHours || stored?.operatingHours || null,
          };
          setUser(mergedUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          authService.logout();
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login handler
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.user) {
        const storedUser = localStorage.getItem('user');
        const stored = storedUser ? JSON.parse(storedUser) : null;
        const mergedUser = {
          ...response.user,
          name: response.user.pharmacyName || response.user.name || stored?.name || null,
          phone: response.user.phone || stored?.phone || null,
          latitude: response.user.latitude || stored?.latitude || null,
          longitude: response.user.longitude || stored?.longitude || null,
          operatingHours: response.user.operatingHours || stored?.operatingHours || null,
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup handler
   */
  const signup = useCallback(async (userData, userType) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (userType === 'client') {
        response = await authService.registerClient(userData);
      } else {
        response = await authService.registerPharmacy(userData);
      }
      // Don't auto-login after signup - user must login manually
      return response;
    } catch (err) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Forgot password handler
   */
  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset password handler
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token, newPassword);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
