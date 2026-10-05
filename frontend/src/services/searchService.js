import api from './api';

export const searchService = {
  async search(query) {
    if (!query || query.trim().length < 2) {
      return { tasks: [], projects: [], users: [] };
    }
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  },
};
