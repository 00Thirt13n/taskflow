import api from './api';

export const projectService = {
  async getProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data.data;
  },

  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  async createProject(data) {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async updateProject(id, data) {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  async getMembers(projectId) {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data.data;
  },

  async addMember(projectId, userId, role = 'member') {
    const response = await api.post(`/projects/${projectId}/members`, {
      user_id: userId,
      role,
    });
    return response.data;
  },

  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};
