import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Kos from '../models/Kos.js';

export const createBookingService = async (userId, body) => {
  const { kosId, tanggalMulai, catatan } = body;
  const durasiBulan = body.durasiBulan || body.durasiSewa;
  if (!kosId || !tanggalMulai || !durasiBulan) {
    const error = new Error('Field kosId, tanggalMulai, dan durasiBulan wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.isValidObjectId(kosId)) {
    const error = new Error('ID kos tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const kos = await Kos.findById(kosId);
  if (!kos || kos.statusVerifikasi !== 'Approved') {
    const error = new Error('Kos tidak ditemukan atau belum tersedia');
    error.statusCode = 404;
    throw error;
  }

  if (kos.jumlahKamarTersedia <= 0) {
    const error = new Error('Kamar kos ini sudah penuh');
    error.statusCode = 400;
    throw error;
  }

  const existingPending = await Booking.findOne({
    userId,
    kosId,
    status: 'PENDING',
  });

  if (existingPending) {
    const error = new Error('Anda sudah memiliki pengajuan booking yang sedang menunggu konfirmasi untuk kos ini');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.create({
    userId,
    kosId,
    tanggalMulai: new Date(tanggalMulai),
    durasiBulan: Number(durasiBulan),
    catatan: catatan ? catatan.trim() : '',
    status: 'PENDING',
  });

  return await booking.populate([
    { path: 'kosId' },
    { path: 'userId', select: 'nama email noHp' },
  ]);
};

export const getMyBookingsService = async (userId) => {
  return await Booking.find({ userId })
    .populate('kosId')
    .sort({ createdAt: -1 });
};

export const cancelBookingService = async (userId, bookingId) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error('ID booking tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    const error = new Error('Booking tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== 'PENDING') {
    const error = new Error(`Booking dengan status '${booking.status}' tidak dapat dibatalkan`);
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'DIBATALKAN';
  await booking.save();

  return booking;
};

export const getOwnerBookingsService = async (ownerId) => {
  const ownerKos = await Kos.find({ ownerId }).select('_id');
  const kosIds = ownerKos.map((k) => k._id);

  return await Booking.find({ kosId: { $in: kosIds } })
    .populate('kosId')
    .populate('userId', 'nama email noHp')
    .sort({ createdAt: -1 });
};

export const approveBookingService = async (ownerId, bookingId) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error('ID booking tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId).populate('kosId');
  if (!booking) {
    const error = new Error('Booking tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (booking.kosId.ownerId.toString() !== ownerId.toString()) {
    const error = new Error('Anda tidak memiliki hak akses untuk menyetujui booking kos ini');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== 'PENDING') {
    const error = new Error(`Booking sudah berstatus '${booking.status}'`);
    error.statusCode = 400;
    throw error;
  }

  const kos = await Kos.findById(booking.kosId._id);
  if (kos.jumlahKamarTersedia <= 0) {
    const error = new Error('Tidak dapat menyetujui booking, kamar kos sudah penuh');
    error.statusCode = 400;
    throw error;
  }

  kos.jumlahKamarTersedia -= 1;
  await kos.save();

  booking.status = 'DISETUJUI';
  await booking.save();

  return booking;
};

export const rejectBookingService = async (ownerId, bookingId) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    const error = new Error('ID booking tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId).populate('kosId');
  if (!booking) {
    const error = new Error('Booking tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (booking.kosId.ownerId.toString() !== ownerId.toString()) {
    const error = new Error('Anda tidak memiliki hak akses untuk menolak booking kos ini');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== 'PENDING') {
    const error = new Error(`Booking sudah berstatus '${booking.status}'`);
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'DITOLAK';
  await booking.save();

  return booking;
};
