import * as bookingService from '../services/bookingService.js';

export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await bookingService.createBookingService(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Pengajuan sewa kamar berhasil dibuat dan menunggu konfirmasi pemilik',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengajukan sewa kamar',
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await bookingService.getMyBookingsService(userId);

    res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil riwayat booking',
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const data = await bookingService.cancelBookingService(userId, bookingId);

    res.status(200).json({
      success: true,
      message: 'Booking berhasil dibatalkan',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal membatalkan booking',
    });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const data = await bookingService.getOwnerBookingsService(ownerId);

    res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil daftar pengajuan sewa',
    });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const bookingId = req.params.id;
    const data = await bookingService.approveBookingService(ownerId, bookingId);

    res.status(200).json({
      success: true,
      message: 'Pengajuan sewa disetujui, jumlah kamar tersedia telah diperbarui',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal menyetujui booking',
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const bookingId = req.params.id;
    const data = await bookingService.rejectBookingService(ownerId, bookingId);

    res.status(200).json({
      success: true,
      message: 'Pengajuan sewa ditolak',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal menolak booking',
    });
  }
};
