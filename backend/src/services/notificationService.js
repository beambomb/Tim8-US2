import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

export const createNotificationService = async (io, { userId, judul, pesan, tipe, metadata }) => {
  if (!userId || !judul || !pesan) {
    return null;
  }

  const notification = await Notification.create({
    userId,
    judul,
    pesan,
    tipe: tipe || 'SYSTEM',
    metadata: metadata || {},
  });

  if (io) {
    io.to(userId.toString()).emit('notification', notification);
  }

  return notification;
};

export const getUserNotificationsService = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markNotificationAsReadService = async (userId, notificationId) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    const error = new Error('ID notifikasi tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Notifikasi tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};
