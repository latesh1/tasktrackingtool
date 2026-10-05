import apiClient from '../api/axios';

export const tagService = {
  async getAll() {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/tags/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  },
};
