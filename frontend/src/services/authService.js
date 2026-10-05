import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    }
  },

  async getProfile() {
    const response = await api.get('/me');
    return response.data.user;
  },
};
