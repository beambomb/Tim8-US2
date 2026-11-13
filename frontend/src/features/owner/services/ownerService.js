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

  async updateAvailability(id, jumlahKamarTersedia) {
    const payload =
      typeof jumlahKamarTersedia === 'object' && jumlahKamarTersedia !== null
        ? jumlahKamarTersedia
        : { jumlahKamarTersedia: Number(jumlahKamarTersedia) };
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

  /**
   * Upload multiple photos to Cloudinary via backend endpoint POST /api/owner/upload
   * Multer middleware on backend uses field name: 'images' (max 5)
   * @param {File[]|FileList|File} files
   */
  async uploadImages(files) {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files];
    fileList.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post('/owner/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Backward compatibility alias for single file
  async uploadPhoto(file) {
    return this.uploadImages([file]);
  },
};
