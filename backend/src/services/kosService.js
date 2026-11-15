import mongoose from 'mongoose';
import Kos from '../models/Kos.js';

const EARTH_RADIUS_METERS = 6371e3;
const toRad = (value) => (value * Math.PI) / 180;

function computeDistanceMeters(userLat, userLng, kosLat, kosLng) {
  const lat1 = toRad(userLat);
  const lat2 = toRad(kosLat);
  const deltaLat = toRad(kosLat - userLat);
  const deltaLng = toRad(kosLng - userLng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

// Mengambil daftar kos yang sudah Approved dengan filter multikriteria + opsional radius lokasi
export const getAllKosService = async (filters = {}) => {
  const {
    hargaMin,
    hargaMax,
    lokasi,
    tipe,
    fasilitas,
    tersedia,
    lat,
    lng,
    radius = 5000,
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

  const hasCoords =
    lat !== undefined && lat !== '' && lng !== undefined && lng !== '';

  if (!hasCoords) {
    return await Kos.find(filter);
  }

  const userLat = Number(lat);
  const userLng = Number(lng);
  const radiusMeters = Number(radius) > 0 ? Number(radius) : 5000;

  if (isNaN(userLat) || isNaN(userLng)) {
    const error = new Error('Parameter latitude dan longitude wajib berupa angka');
    error.statusCode = 400;
    throw error;
  }

  const matchedKos = await Kos.find(filter).populate('ownerId', 'nama email noHp');

  return matchedKos
    .map((kos) => {
      const distance = computeDistanceMeters(userLat, userLng, kos.latitude, kos.longitude);
      return {
        ...kos.toObject(),
        jarakMeter: distance,
        jarakKm: (distance / 1000).toFixed(2),
      };
    })
    .filter((kos) => kos.jarakMeter <= radiusMeters)
    .sort((a, b) => a.jarakMeter - b.jarakMeter);
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
  if (latitude === undefined || longitude === undefined) {
    const error = new Error('Parameter latitude dan longitude wajib berupa angka');
    error.statusCode = 400;
    throw error;
  }

  return getAllKosService({
    lat: latitude,
    lng: longitude,
    radius: maxDistance,
  });
};