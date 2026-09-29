import * as notificationService from '../services/notificationService.js';

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await notificationService.getUserNotificationsService(userId);

    res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil notifikasi',
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const data = await notificationService.markNotificationAsReadService(userId, notificationId);

    res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai sebagai telah dibaca',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal memperbarui notifikasi',
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await notificationService.markAllNotificationsAsReadService(userId);

    res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai sebagai telah dibaca',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal memperbarui notifikasi',
    });
  }
};
