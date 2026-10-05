import apiClient from '../api/axios';

export const commentService = {
  async create(taskId, comment) {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { comment });
    return response.data;
  },

  async update(commentId, comment) {
    const response = await apiClient.put(`/comments/${commentId}`, { comment });
    return response.data;
  },

  async delete(commentId) {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
