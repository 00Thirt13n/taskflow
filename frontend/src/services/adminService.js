import api from './api';

export const adminService = {
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
