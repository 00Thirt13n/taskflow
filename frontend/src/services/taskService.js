import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/tasks/stats');
    return response.data.stats;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task;
  },

  async createTask(data) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async suggestAi(title, description = '') {
    const response = await api.post('/ai/suggest', { title, description });
    return response.data.suggestion;
  },
};
