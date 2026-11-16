import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { isEmailConfigured, sendNotificationEmail } from './emailService.js';

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

  if (isEmailConfigured()) {
    try {
      const recipient = await User.findById(userId).select('nama email');
      if (recipient?.email) {
        await sendNotificationEmail({
          to: recipient.email,
          recipientName: recipient.nama,
          judul,
          pesan,
          tipe: tipe || 'SYSTEM',
        });
      }
    } catch (err) {
      console.warn('[email] Gagal mengirim email notifikasi:', err.message);
    }
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

export const markAllNotificationsAsReadService = async (userId) => {
  return await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};
