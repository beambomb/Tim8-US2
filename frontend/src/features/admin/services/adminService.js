import api from '@/lib/api';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getSubmissions() {
    const response = await api.get('/admin/submissions');
    return response.data;
  },

  async getSubmissionDetail(id) {
    const response = await api.get(`/admin/submissions/${id}`);
    return response.data;
  },

  async approveSubmission(id) {
    const response = await api.patch(`/admin/submissions/${id}/approve`);
    return response.data;
  },

  async rejectSubmission(id, reason) {
    const response = await api.patch(`/admin/submissions/${id}/reject`, { reason });
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};
