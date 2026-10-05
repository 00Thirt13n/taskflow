import api from './api';

export const savedViewService = {
  async getSavedViews() {
    const response = await api.get('/saved-views');
    return response.data.data;
  },

  async saveView(name, filters, view_mode = 'list', is_default = false) {
    const response = await api.post('/saved-views', {
      name,
      filters,
      view_mode,
      is_default,
    });
    return response.data;
  },

  async deleteView(id) {
    const response = await api.delete(`/saved-views/${id}`);
    return response.data;
  },
};
