import api from '@/lib/api';

export const chatService = {
  async getInbox() {
    const response = await api.get('/chat/inbox');
    return response.data;
  },

  async getSupportContact() {
    const response = await api.get('/chat/support');
    return response.data;
  },

  async getMessages(targetUserId) {
    const response = await api.get(`/chat/${targetUserId}`);
    return response.data;
  },

  async getKosContext(kosId) {
    if (!kosId) return null;
    const response = await api.get(`/kos/${kosId}`);
    return response.data;
  },

  async sendMessage(receiverId, message, kosId = null) {
    const payload = {
      receiverId,
      pesan: message,
      ...(kosId ? { kosId } : {}),
    };
    const response = await api.post('/chat/send', payload);
    return response.data;
  },

  async sendMessageHttp(receiverId, message, kosId = null) {
    return this.sendMessage(receiverId, message, kosId);
  },

  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markNotificationRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
