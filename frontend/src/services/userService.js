import apiClient from '../api/axios';

export const userService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  async changePassword(data) {
    const response = await apiClient.put('/profile/password', data);
    return response.data;
  },
};
