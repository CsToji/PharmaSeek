/**
 * Reservation Service
 * Handles reservation creation, management, and status updates
 */

import apiClient from './apiClient';

const reservationService = {
  /**
   * Get all reservations (Admin only)
   */
  getAllReservations: async () => {
    const response = await apiClient.get('/reservations/all');
    return response;
  },

  /**
   * Get reservation by ID
   */
  getReservationById: async (reservationId) => {
    const response = await apiClient.get(`/reservations/${reservationId}`);
    return response;
  },

  /**
   * Get authenticated user's reservations
   */
  getMyReservations: async () => {
    const response = await apiClient.get('/reservations/me');
    return response;
  },

  /**
   * Get specific reservation for authenticated user
   */
  getMyReservation: async (reservationId) => {
    const response = await apiClient.get(`/reservations/me/${reservationId}`);
    return response;
  },

  /**
   * Get reservations by client ID
   */
  getClientReservations: async (clientId) => {
    const response = await apiClient.get(`/reservations/client/${clientId}`);
    return response;
  },

  /**
   * Get reservations for a pharmacy
   */
  getPharmacyReservations: async (pharmacyId) => {
    const response = await apiClient.get(`/reservations/pharmacy/${pharmacyId}`);
    return response;
  },

  /**
   * Get pharmacy's own reservations
   */
  getMyPharmacyReservations: async () => {
    const response = await apiClient.get('/reservations/pharmacy/me');
    return response;
  },

  /**
   * Create new reservation
   */
  createReservation: async (reservationData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await apiClient.post('/reservations', {
      clientId: user?.id,
      pharmacyId: reservationData.pharmacyId,
      items: reservationData.items.map((item) => ({
        drugId: item.drugId,
        quantity: item.quantity,
      })),
      notes: reservationData.notes || '',
    });
    return response;
  },

  /**
   * Update reservation notes
   */
  updateReservation: async (reservationId, notes) => {
    const response = await apiClient.put(`/reservations/${reservationId}`, {
      notes,
    });
    return response;
  },

  /**
   * Update reservation status
   */
  updateReservationStatus: async (reservationId, status) => {
    const response = await apiClient.put(`/reservations/${reservationId}/status`, {
      status,
    });
    return response;
  },

  /**
   * Cancel reservation
   */
  cancelReservation: async (reservationId) => {
    const response = await apiClient.delete(`/reservations/${reservationId}`);
    return response;
  },
};

export default reservationService;
