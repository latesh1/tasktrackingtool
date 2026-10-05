import apiClient from '../api/axios';

export const projectService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  async getProjectTasks(projectId, params = {}) {
    const response = await apiClient.get(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },
};
