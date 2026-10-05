import apiClient from '../api/axios';

export const attachmentService = {
  async upload(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(attachmentId) {
    const response = await apiClient.delete(`/attachments/${attachmentId}`);
    return response.data;
  },
};
