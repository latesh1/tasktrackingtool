import apiClient from '../api/axios';

export const dashboardService = {
  async getStats() {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};
