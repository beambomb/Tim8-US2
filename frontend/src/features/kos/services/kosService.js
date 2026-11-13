import api from '@/lib/api';

export const kosService = {
  async getKosList(params = {}) {
    const response = await api.get('/kos', { params });
    return response.data;
  },

  async getKosDetail(id) {
    const response = await api.get(`/kos/${id}`);
    return response.data;
  },

  async getNearbyKos(lat, lng, radiusKm = 5) {
    // Backend expects radius in METERS (maxDistance default is 5000 meters)
    const radiusMeters = Math.round(Number(radiusKm) * 1000);
    const response = await api.get('/kos/nearby', {
      params: { lat, lng, radius: radiusMeters },
    });
    return response.data;
  },

  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addFavorite(kosId) {
    const response = await api.post('/favorites', { kosId });
    return response.data;
  },

  async removeFavorite(favoriteId) {
    const response = await api.delete(`/favorites/${favoriteId}`);
    return response.data;
  },

  async getReviews(kosId) {
    const response = await api.get(`/kos/${kosId}/reviews`);
    return response.data;
  },

  async addReview(kosId, reviewData) {
    const response = await api.post(`/kos/${kosId}/reviews`, reviewData);
    return response.data;
  },
};
