import api from './api';

export const adminService = {
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  async getSystemHealth() {
    const response = await api.get('/admin/system-health');
    return response.data;
  },
};
