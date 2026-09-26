import mongoose from 'mongoose';
import Favorite from '../models/Favorite.js';
import Kos from '../models/Kos.js';

// Mengambil daftar favorit milik user
export const getFavoritesService = async (userId) => {
  return await Favorite.find({
    userId
  }).populate('kosId');
};

// Menambahkan kos ke favorit
export const addFavoriteService = async (userId, kosId) => {
  if (!kosId) {
    const error = new Error('kosId wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.isValidObjectId(kosId)) {
    const error = new Error('kosId tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const kos = await Kos.findById(kosId);

  if (!kos) {
    const error = new Error('Kos tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  if (kos.statusVerifikasi !== 'Approved') {
    const error = new Error('Kos belum tersedia untuk publik');
    error.statusCode = 400;
    throw error;
  }

  const existingFavorite = await Favorite.findOne({
    userId,
    kosId
  });

  if (existingFavorite) {
    const error = new Error('Kos sudah ada di favorit');
    error.statusCode = 400;
    throw error;
  }

  return await Favorite.create({
    userId,
    kosId
  });
};

// Menghapus favorit
export const deleteFavoriteService = async (userId, id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('ID favorit tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const favorite = await Favorite.findOneAndDelete({
    _id: id,
    userId
  });

  if (!favorite) {
    const error = new Error('Favorit tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return favorite;
};
