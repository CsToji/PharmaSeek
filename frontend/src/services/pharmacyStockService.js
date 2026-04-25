/**
 * Pharmacy Stock Service
 * Handles inventory/stock related API calls
 */

import apiClient from './apiClient';

const pharmacyStockService = {
  /**
   * Get all stock (Admin only)
   */
  getAllStock: async () => {
    const response = await apiClient.get('/pharmacy-stock/all');
    return response;
  },

  /**
   * Get stock item by ID
   */
  getStockById: async (stockId) => {
    const response = await apiClient.get(`/pharmacy-stock/${stockId}`);
    return response;
  },

  /**
   * Get pharmacies that have a specific drug in stock
   */
  getPharmaciesWithDrug: async (drugId) => {
    const response = await apiClient.get(`/pharmacy-stock/drug/${drugId}`);
    return response;
  },

  /**
   * Get pharmacy inventory (Pharmacy/Admin)
   */
  getPharmacyInventory: async (pharmacyId) => {
    const response = await apiClient.get(`/pharmacy-stock/pharmacy/${pharmacyId}`);
    return response;
  },

  /**
   * Get pharmacy's own inventory (from auth context)
   */
  getMyInventory: async () => {
    const response = await apiClient.get('/pharmacy-stock');
    return response;
  },

  /**
   * Get stock by drug ID (which pharmacies have this drug)
   */
  getStockByDrug: async (drugId) => {
    const response = await apiClient.get(`/pharmacy-stock/drug/${drugId}`);
    return response;
  },

  /**
   * Add stock item with existing drug
   */
  addStock: async (stockData) => {
    const response = await apiClient.post('/pharmacy-stock', {
      drugId: stockData.drugId,
      quantity: stockData.quantity,
      price: stockData.price,
      reservationDelayMinutes: stockData.reservationDelayMinutes || 24,
    });
    return response;
  },

  /**
   * Add stock item and create new drug in one step
   */
  addStockWithDrug: async (drugData, stockData) => {
    const response = await apiClient.post('/pharmacy-stock/with-drug', {
      drug: {
        name: drugData.name,
        description: drugData.description,
        category: drugData.category,
        manufacturer: drugData.manufacturer,
        barCode: drugData.barCode || null,
        requiresPrescription: drugData.requiresPrescription || false,
      },
      stock: {
        quantity: stockData.quantity,
        price: stockData.price,
        reservationDelayMinutes: stockData.reservationDelayMinutes || 24,
      },
    });
    return response;
  },

  /**
   * Update stock quantity/price
   */
  updateStock: async (stockId, stockData) => {
    const response = await apiClient.put(`/pharmacy-stock/${stockId}`, {
      quantity: stockData.quantity,
      price: stockData.price,
      reservationDelayMinutes: stockData.reservationDelayMinutes,
    });
    return response;
  },

  /**
   * Delete stock item
   */
  deleteStock: async (stockId) => {
    const response = await apiClient.delete(`/pharmacy-stock/${stockId}`);
    return response;
  },

  /**
   * Autocomplete drug names from stock table
   */
  autocompleteDrugs: async (name) => {
    const response = await apiClient.get(`/pharmacy-stock/autocomplete?name=${encodeURIComponent(name)}`);
    return response;
  },

  getNearbyPharmacies: async (drugId, latitude, longitude) => {
    const response = await apiClient.get(`/pharmacy-stock/nearby/${drugId}?latitude=${latitude}&longitude=${longitude}`);
    return response;
  },

  getAllPharmacies: async () => {
    const response = await apiClient.get('/pharmacies');
    return response;
  },
};

export default pharmacyStockService;
