import api from '@/lib/api';

export const chatService = {
  async getInbox() {
    const response = await api.get('/chat/inbox');
    return response.data;
  },

  async getMessages(targetUserId) {
    const response = await api.get(`/chat/${targetUserId}`);
    return response.data;
  },

  async sendMessageHttp(receiverId, message) {
    const response = await api.post('/chat/send', { receiverId, message });
    return response.data;
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
