import {
  getAllKosService,
  getKosByIdService,
  getNearbyKosService
} from '../services/kosService.js';

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

export const getNearbyKos = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter lat dan lng wajib diisi',
      });
    }

    const data = await getNearbyKosService(lat, lng, radius);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar kos terdekat',
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Gagal mencari kos terdekat',
    });
  }
};