import api from '@/lib/api';

export const ownerService = {
  async getOwnerKos() {
    const response = await api.get('/owner/kos');
    return response.data;
  },

  async createKos(kosData) {
    const response = await api.post('/owner/kos', kosData);
    return response.data;
  },

  async updateKos(id, kosData) {
    const response = await api.put(`/owner/kos/${id}`, kosData);
    return response.data;
  },

  async deleteKos(id) {
    const response = await api.delete(`/owner/kos/${id}`);
    return response.data;
  },

  async updateAvailability(id, payload) {
    const response = await api.patch(`/owner/kos/${id}/availability`, payload);
    return response.data;
  },

  async submitVerification(id) {
    const response = await api.post(`/owner/kos/${id}/submit`);
    return response.data;
  },

  async getVerificationStatus(id) {
    const response = await api.get(`/owner/kos/${id}/status`);
    return response.data;
  },

  async getOwnerBookings() {
    const response = await api.get('/bookings/owner');
    return response.data;
  },

  async updateBookingStatus(bookingId, status) {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async uploadPhoto(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
