import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    pesan: {
      type: String,
      required: true,
      trim: true,
    },
    tipe: {
      type: String,
      enum: ['SYSTEM', 'KOS_VERIFIKASI', 'BOOKING_BARU', 'BOOKING_STATUS'],
      default: 'SYSTEM',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
