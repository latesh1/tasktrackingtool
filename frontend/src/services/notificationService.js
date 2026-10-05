import apiClient from '../api/axios';

export const notificationService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
};
