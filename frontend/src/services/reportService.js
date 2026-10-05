import api from './api';

export const reportService = {
  async getOverview() {
    const response = await api.get('/reports/overview');
    return response.data;
  },

  getExportUrl() {
    const token = localStorage.getItem('taskflow_token');
    return `/api/reports/export?token=${token}`;
  },
};
