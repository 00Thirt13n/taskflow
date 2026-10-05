import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getStats(params = {}) {
    const response = await api.get('/tasks/stats', { params });
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

  async reorderTask(id, position, status = null) {
    const response = await api.patch(`/tasks/${id}/reorder`, { position, status });
    return response.data;
  },

  async toggleBlocker(id, is_blocked, blocker_reason = null) {
    const response = await api.post(`/tasks/${id}/block`, { is_blocked, blocker_reason });
    return response.data;
  },

  async addSubtask(taskId, title) {
    const response = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return response.data;
  },

  async addComment(taskId, body) {
    const response = await api.post(`/tasks/${taskId}/comments`, { body });
    return response.data;
  },

  async deleteComment(taskId, commentId) {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  async bulkAction(action, task_ids, value = null) {
    const response = await api.post('/tasks/bulk', { action, task_ids, value });
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

  async generateSubtasksAi(title, description = '') {
    const response = await api.post('/ai/subtasks', { title, description });
    return response.data.subtasks;
  },

  async improveDescriptionAi(title, description = '') {
    const response = await api.post('/ai/improve-description', { title, description });
    return response.data.improved_description;
  },

  async parseNaturalTaskAi(prompt) {
    const response = await api.post('/ai/natural-task', { prompt });
    return response.data;
  },
};
