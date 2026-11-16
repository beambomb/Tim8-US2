import Booking from '../models/Booking.js';
import Favorite from '../models/Favorite.js';
import Kos from '../models/Kos.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { deleteCloudinaryImages } from './uploadService.js';

/**
 * Delete all dependent records and uploaded photos belonging to one or more kos properties.
 */
export async function cascadeDeleteKosRecords(kosInput = []) {
  const kosList = Array.isArray(kosInput) ? kosInput : [kosInput];
  const validItems = kosList.filter(Boolean);
  if (validItems.length === 0) return;

  const kosIds = validItems.map((item) => item?._id || item).filter(Boolean);
  if (kosIds.length === 0) return;

  const kosIdStrings = kosIds.map((id) => String(id));
  const imageUrls = validItems.flatMap((item) =>
    Array.isArray(item?.fotoUrls) ? item.fotoUrls : []
  );

  await Promise.all([
    Booking.deleteMany({ kosId: { $in: kosIds } }),
    Review.deleteMany({ kosId: { $in: kosIds } }),
    Favorite.deleteMany({ kosId: { $in: kosIds } }),
    Notification.deleteMany({
      $or: [
        { 'metadata.kosId': { $in: kosIds } },
        { 'metadata.kosId': { $in: kosIdStrings } },
      ],
    }),
    Message.updateMany({ kosId: { $in: kosIds } }, { $set: { kosId: null } }),
    deleteCloudinaryImages(imageUrls),
  ]);
}

/**
 * Permanently delete a user along with all their chats, notifications,
 * bookings, reviews, favorites, and any owned kos properties.
 */
export async function cascadeDeleteUserById(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) return null;

  const ownedKos = await Kos.find({ ownerId: user._id });
  if (ownedKos.length > 0) {
    await cascadeDeleteKosRecords(ownedKos);
    await Kos.deleteMany({ ownerId: user._id });
  }

  await Promise.all([
    Message.deleteMany({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    }),
    Notification.deleteMany({ userId: user._id }),
    Booking.deleteMany({ userId: user._id }),
    Review.deleteMany({ userId: user._id }),
    Favorite.deleteMany({ userId: user._id }),
  ]);

  await User.findByIdAndDelete(user._id);
  return user;
}
