import api from '@/lib/api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async saveCampus(campus) {
    const response = await api.post('/auth/campuses', campus);
    return response.data;
  },

  async removeCampus(campusId) {
    const response = await api.delete(`/auth/campuses/${encodeURIComponent(campusId)}`);
    return response.data;
  },
};
