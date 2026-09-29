import * as reviewService from '../services/reviewService.js';

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const kosId = req.params.id;
    const rating = req.body.rating;
    const komentar = req.body.komentar || req.body.comment;

    const data = await reviewService.createReviewService(userId, kosId, {
      rating,
      komentar,
    });

    res.status(201).json({
      success: true,
      message: 'Ulasan berhasil ditambahkan',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal menambahkan ulasan',
    });
  }
};

export const getKosReviews = async (req, res) => {
  try {
    const kosId = req.params.id;
    const data = await reviewService.getKosReviewsService(kosId);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar ulasan',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mengambil ulasan',
    });
  }
};
