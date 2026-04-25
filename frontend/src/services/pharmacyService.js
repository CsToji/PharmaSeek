import apiClient from './apiClient';

const pharmacyService = {
  updateMyPharmacy: async (pharmacyData) => {
    const response = await apiClient.put('/pharmacies/me', pharmacyData);
    return response;
  },
};

export default pharmacyService;