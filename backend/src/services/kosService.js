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

  const kos = await Kos.findById(id).populate('ownerId', 'nama email noHp');

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

export const getNearbyKosService = async (latitude, longitude, maxDistance = 5000) => {
  const userLat = Number(latitude);
  const userLng = Number(longitude);
  const radiusMeters = Number(maxDistance);

  if (isNaN(userLat) || isNaN(userLng)) {
    const error = new Error('Parameter latitude dan longitude wajib berupa angka');
    error.statusCode = 400;
    throw error;
  }

  const allKos = await Kos.find({ statusVerifikasi: 'Approved' }).populate('ownerId', 'nama email noHp');

  const R = 6371e3;
  const toRad = (value) => (value * Math.PI) / 180;

  const nearbyKos = allKos
    .map((kos) => {
      const lat1 = toRad(userLat);
      const lat2 = toRad(kos.latitude);
      const deltaLat = toRad(kos.latitude - userLat);
      const deltaLng = toRad(kos.longitude - userLng);

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c);

      return {
        ...kos.toObject(),
        jarakMeter: distance,
        jarakKm: (distance / 1000).toFixed(2),
      };
    })
    .filter((kos) => kos.jarakMeter <= radiusMeters)
    .sort((a, b) => a.jarakMeter - b.jarakMeter);

  return nearbyKos;
};