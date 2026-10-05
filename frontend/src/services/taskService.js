import apiClient from '../api/axios';

export const taskService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  async assign(id, assignedTo) {
    const response = await apiClient.post(`/tasks/${id}/assign`, { assigned_to: assignedTo });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async getSubtasks(taskId) {
    const response = await apiClient.get(`/tasks/${taskId}/subtasks`);
    return response.data;
  },

  async createSubtask(taskId, data) {
    const response = await apiClient.post(`/tasks/${taskId}/subtasks`, data);
    return response.data;
  },

  async getActivities(taskId) {
    const response = await apiClient.get(`/tasks/${taskId}/activities`);
    return response.data;
  },

  async getOverdue(params = {}) {
    const response = await apiClient.get('/tasks/overdue', { params });
    return response.data;
  },

  async bulkAction(taskIds, action, extra = {}) {
    const response = await apiClient.post('/tasks/bulk', {
      task_ids: taskIds,
      action,
      ...extra,
    });
    return response.data;
  },

  async getDashboard() {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};
