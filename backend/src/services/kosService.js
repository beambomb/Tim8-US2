import mongoose from 'mongoose';
import Kos from '../models/Kos.js';

// Mengambil daftar kos yang sudah Approved dengan filter
export const getAllKosService = async (filters) => {
  const {
    hargaMin,
    hargaMax,
    lokasi,
    tipe,
    fasilitas,
    tersedia
  } = filters;

  const filter = {
    statusVerifikasi: 'Approved'
  };

  if (hargaMin) {
    filter.harga = {
      ...filter.harga,
      $gte: Number(hargaMin)
    };
  }

  if (hargaMax) {
    filter.harga = {
      ...filter.harga,
      $lte: Number(hargaMax)
    };
  }

  if (lokasi) {
    filter.lokasi = {
      $regex: lokasi,
      $options: 'i'
    };
  }

  if (tipe) {
    filter.tipe = {
      $regex: tipe,
      $options: 'i'
    };
  }

  if (fasilitas) {
    filter.fasilitas = {
      $regex: fasilitas,
      $options: 'i'
    };
  }

  if (tersedia === 'true') {
    filter.jumlahKamarTersedia = {
      $gt: 0
    };
  }

  return await Kos.find(filter);
};

// Mengambil detail kos yang sudah Approved
export const getKosByIdService = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('ID kos tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const kos = await Kos.findById(id);

  if (!kos) {
    const error = new Error(`Kos dengan ID ${id} tidak ditemukan`);
    error.statusCode = 404;
    throw error;
  }

  if (kos.statusVerifikasi !== 'Approved') {
    const error = new Error('Kos tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return kos;
};