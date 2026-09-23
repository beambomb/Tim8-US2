import Kos from '../models/Kos.js';

// 1. Menampilkan daftar kos yang sudah Approved
// Mendukung filter: harga, lokasi, tipe, fasilitas
export const getAllKos = async (req, res) => {
  try {
    const { hargaMin, hargaMax, lokasi, tipe, fasilitas } = req.query;

    // Filter dasar: hanya kos yang sudah Approved
    const filter = {
      statusVerifikasi: 'Approved'
    };

    // Filter harga minimum
    if (hargaMin) {
      filter.harga = {
        ...filter.harga,
        $gte: Number(hargaMin)
      };
    }

    // Filter harga maksimum
    if (hargaMax) {
      filter.harga = {
        ...filter.harga,
        $lte: Number(hargaMax)
      };
    }

    // Filter lokasi
    if (lokasi) {
      filter.lokasi = {
        $regex: lokasi,
        $options: 'i'
      };
    }

    // Filter tipe
    if (tipe) {
      filter.tipe = {
        $regex: tipe,
        $options: 'i'
      };
    }

    // Filter fasilitas
    if (fasilitas) {
      filter.fasilitas = {
        $regex: fasilitas,
        $options: 'i'
      };
    }

    const kos = await Kos.find(filter);

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar kos',
      data: kos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar kos',
      error: error.message
    });
  }
};

// 2. Menampilkan detail kos berdasarkan ID
export const getKosById = async (req, res) => {
  try {
    const { id } = req.params;

    const kos = await Kos.findById(id);

    // Jika kos tidak ditemukan
    if (!kos) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    // Hanya kos yang sudah Approved yang boleh dilihat pencari
    if (kos.statusVerifikasi !== 'Approved') {
      return res.status(404).json({
        success: false,
        message: 'Kos tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail kos',
      data: kos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kos',
      error: error.message
    });
  }
};