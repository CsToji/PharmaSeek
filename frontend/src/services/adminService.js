/**
 * Admin Service
 * Handles admin dashboard API calls
 */

import apiClient from './apiClient';

const adminService = {
    getStats: async () => {
        const response = await apiClient.get('/api/admin/stats');
        return response;
    },

    getPendingPharmacies: async () => {
        const response = await apiClient.get('/api/admin/pharmacies/pending');
        return response;
    },

    approvePharmacy: async (pharmacyId, approved) => {
        const response = await apiClient.patch(`/api/admin/pharmacies/${pharmacyId}/approval`, {
            approved,
        });
        return response;
    },

    getAllUsers: async () => {
        const response = await apiClient.get('/api/admin/users');
        return response;
    },

    getAllPharmacies: async () => {
        const response = await apiClient.get('/api/admin/users/pharmacies');
        return response;
    },

    getAllReservations: async () => {
        const response = await apiClient.get('/api/admin/reservations');
        return response;
    },

    getAllDrugs: async () => {
        const response = await apiClient.get('/api/admin/drugs');
        return response;
    },

    updateUserRole: async (userId, role) => {
        const response = await apiClient.put(`/users/${userId}/role`, {
            role,
        });
        return response;
    },
};

export default adminService;