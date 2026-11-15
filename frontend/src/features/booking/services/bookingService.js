import api from '@/lib/api';

export const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  async cancelBooking(bookingId) {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  async getOwnerBookings() {
    const response = await api.get('/bookings/owner');
    return response.data;
  },

  async approveBooking(bookingId) {
    const response = await api.patch(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  async rejectBooking(bookingId) {
    const response = await api.patch(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  async updateBookingStatus(bookingId, status) {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'disetujui') {
      return this.approveBooking(bookingId);
    }
    if (s === 'rejected' || s === 'ditolak') {
      return this.rejectBooking(bookingId);
    }
    throw new Error('Status booking tidak valid.');
  },
};

export default bookingService;