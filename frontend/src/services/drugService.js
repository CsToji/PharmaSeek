/**
 * Drug Service
 * Handles drug/medication related API calls
 */

import apiClient from './apiClient';

const drugService = {
  /**
   * Get all drugs
   */
  getAllDrugs: async () => {
    const response = await apiClient.get('/drugs');
    return response;
  },

  /**
   * Get drug by ID
   */
  getDrugById: async (drugId) => {
    const response = await apiClient.get(`/drugs/${drugId}`);
    return response;
  },

  /**
   * Search drugs by name
   */
  searchDrugs: async (searchQuery) => {
    const response = await apiClient.get(`/drugs/search?name=${encodeURIComponent(searchQuery)}`);
    return response;
  },

  /**
   * Create new drug (Pharmacy/Admin only)
   */
  createDrug: async (drugData) => {
    const response = await apiClient.post('/drugs', {
      name: drugData.name,
      description: drugData.description,
      requiresPrescription: drugData.requiresPrescription || false,
    });
    return response;
  },

  /**
   * Update drug (Pharmacy/Admin only)
   */
  updateDrug: async (drugId, drugData) => {
    const response = await apiClient.put(`/drugs/${drugId}`, {
      name: drugData.name,
      description: drugData.description,
      requiresPrescription: drugData.requiresPrescription,
    });
    return response;
  },

  /**
   * Delete drug (Admin only)
   */
  deleteDrug: async (drugId) => {
    const response = await apiClient.delete(`/drugs/${drugId}`);
    return response;
  },
};

export default drugService;
