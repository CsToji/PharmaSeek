/**
 * Authentication Service
 * Handles login, signup, logout, and token refresh
 */

import apiClient from './apiClient';

const authService = {
  /**
   * Register a new client (patient)
   */
  registerClient: async (clientData) => {
    const response = await apiClient.post('/auth/signup/client', {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      password: clientData.password,
    });
    return response;
  },

  /**
   * Register a new pharmacy
   */
  registerPharmacy: async (pharmacyData) => {
    const response = await apiClient.post('/auth/signup/pharmacy', {
      pharmacyName: pharmacyData.pharmacyName,
      email: pharmacyData.email,
      taxId: pharmacyData.taxId,
      password: pharmacyData.password,
      address: pharmacyData.address,
      latitude: pharmacyData.latitude,
      longitude: pharmacyData.longitude,
    });
    return response;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Store access token
    if (response.accessToken) {
      apiClient.setAccessToken(response.accessToken);
    }

    return response;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh', {});
    if (response.accessToken) {
      apiClient.setAccessToken(response.accessToken);
    }
    return response;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      apiClient.setAccessToken(null);
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', {
      email,
    });
    return response;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get stored access token
   */
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
};

export default authService;
