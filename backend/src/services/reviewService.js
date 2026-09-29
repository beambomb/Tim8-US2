import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Kos from '../models/Kos.js';

export const createReviewService = async (userId, kosId, { rating, komentar }) => {
  if (!rating || !komentar) {
    const error = new Error('Rating dan komentar wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    const error = new Error('Rating harus berupa angka antara 1 sampai 5');
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
    const error = new Error('Kos tidak ditemukan atau belum tersedia untuk publik');
    error.statusCode = 404;
    throw error;
  }

  const existingReview = await Review.findOne({ userId, kosId });
  if (existingReview) {
    const error = new Error('Anda sudah memberikan ulasan untuk kos ini');
    error.statusCode = 400;
    throw error;
  }

  const review = await Review.create({
    userId,
    kosId,
    rating: numericRating,
    komentar: komentar.trim(),
  });

  return await review.populate('userId', 'nama');
};

export const getKosReviewsService = async (kosId) => {
  if (!mongoose.isValidObjectId(kosId)) {
    const error = new Error('ID kos tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const reviews = await Review.find({ kosId })
    .populate('userId', 'nama')
    .sort({ createdAt: -1 });

  const total = reviews.length;
  const averageRating =
    total > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
      : '0.0';

  return {
    total,
    averageRating: Number(averageRating),
    reviews,
  };
};
