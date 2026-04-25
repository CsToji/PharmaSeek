import apiClient from './apiClient';

const clientService = {
  getMyProfile: async () => {
    const response = await apiClient.get('/clients/me');
    return response;
  },

  updateMyProfile: async (profileData) => {
    const response = await apiClient.put('/clients/me', {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone
    });
    return response;
  },
};

export default clientService;