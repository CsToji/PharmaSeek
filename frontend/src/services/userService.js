/**
 * User Service
 * Handles user management and profile operations
 */

import apiClient from './apiClient';

const userService = {
  /**
   * Get all users (Admin only)
   */
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response;
  },

  /**
   * Get users by role (Admin only)
   */
  getUsersByRole: async (role) => {
    const response = await apiClient.get(`/users/role/${role}`);
    return response;
  },

  /**
   * Update user role (Admin only)
   */
  updateUserRole: async (userId, role) => {
    const response = await apiClient.patch(`/users/${userId}/role`, {
      role,
    });
    return response;
  },

  getPendingPharmacies: async () => {
    const response = await apiClient.get('/users/pharmacies/pending');
    return response;
  },

  approvePharmacy: async (pharmacyId, approved) => {
    const response = await apiClient.patch(`/users/pharmacies/${pharmacyId}/approval`, {
      approved,
    });
    return response;
  },
};

export default userService;
