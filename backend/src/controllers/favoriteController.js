import {
  getFavoritesService,
  addFavoriteService,
  deleteFavoriteService
} from '../services/favoriteService.js';

// 1. Menampilkan daftar favorit
export const getFavorites = async (req, res) => {
  try {
    const favorites = await getFavoritesService(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar favorit',
      data: favorites
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Gagal mengambil daftar favorit',
      ...(error.statusCode ? {} : { error: error.message })
    });
  }
};

// 2. Menambahkan kos ke favorit
export const addFavorite = async (req, res) => {
  try {
    const favorite = await addFavoriteService(
      req.user.id,
      req.body.kosId
    );

    res.status(201).json({
      success: true,
      message: 'Kos berhasil ditambahkan ke favorit',
      data: favorite
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Gagal menambahkan favorit',
      ...(error.statusCode ? {} : { error: error.message })
    });
  }
};

// 3. Menghapus favorit
export const deleteFavorite = async (req, res) => {
  try {
    await deleteFavoriteService(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Favorit berhasil dihapus'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Gagal menghapus favorit',
      ...(error.statusCode ? {} : { error: error.message })
    });
  }
};
