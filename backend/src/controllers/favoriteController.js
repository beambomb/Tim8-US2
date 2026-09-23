import Favorite from '../models/Favorite.js';

// 1. Menampilkan daftar favorit milik user yang sedang login
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user.id
    }).populate('kosId');

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar favorit',
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar favorit',
      error: error.message
    });
  }
};

// 2. Menambahkan kos ke favorit
export const addFavorite = async (req, res) => {
  try {
    const { kosId } = req.body;

    if (!kosId) {
      return res.status(400).json({
        success: false,
        message: 'kosId wajib diisi'
      });
    }

    const existingFavorite = await Favorite.findOne({
      userId: req.user.id,
      kosId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Kos sudah ada di favorit'
      });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      kosId
    });

    res.status(201).json({
      success: true,
      message: 'Kos berhasil ditambahkan ke favorit',
      data: favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan favorit',
      error: error.message
    });
  }
};

// 3. Menghapus favorit
export const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorit tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Favorit berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus favorit',
      error: error.message
    });
  }
};