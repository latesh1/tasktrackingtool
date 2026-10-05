import apiClient from '../api/axios';

export const authService = {
  async register(data) {
    const response = await apiClient.post('/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get('/user');
    return response.data;
  },
};
