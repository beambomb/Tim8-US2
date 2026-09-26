import {
  getAllKosService,
  getKosByIdService
} from '../services/kosService.js';

// 1. Menampilkan daftar kos
export const getAllKos = async (req, res) => {
  try {
    const kos = await getAllKosService(req.query);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar kos',
      data: kos
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Gagal mengambil daftar kos',
      ...(error.statusCode ? {} : { error: error.message })
    });
  }
};

// 2. Menampilkan detail kos berdasarkan ID
export const getKosById = async (req, res) => {
  try {
    const kos = await getKosByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail kos',
      data: kos
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Gagal mengambil detail kos',
      ...(error.statusCode ? {} : { error: error.message })
    });
  }
};