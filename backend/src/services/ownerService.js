import Kos from '../models/Kos.js';
import { cascadeDeleteKosRecords } from './deletionService.js';

function normalizeFacilities(list) {
    if (!Array.isArray(list)) return list;
    const seen = new Set();
    const result = [];
    for (const raw of list) {
        const cleaned = String(raw || '').trim().replace(/\s+/g, ' ');
        if (!cleaned) continue;
        const normalizedKey = cleaned.toLowerCase();
        if (seen.has(normalizedKey)) continue;
        seen.add(normalizedKey);
        result.push(cleaned.slice(0, 40));
        if (result.length >= 25) break;
    }
    return result;
}

export const getOwnerKosService = async (ownerId) => {
    return await Kos.find({ ownerId });
};

export const createKosService = async (ownerId, data) => {
    const newKos = new Kos({
        ...data,
        ...(data.fasilitas !== undefined
            ? { fasilitas: normalizeFacilities(data.fasilitas) }
            : {}),
        ownerId,
        jumlahKamarTersedia: data.jumlahKamar,
        statusVerifikasi: 'Pending'
    });
    return await newKos.save();
};

const ALLOWED_KOS_UPDATE_FIELDS = [
    'nama',
    'harga',
    'lokasi',
    'latitude',
    'longitude',
    'tipe',
    'fasilitas',
    'jumlahKamar',
    'jumlahKamarTersedia',
    'fotoUrls',
];

export const updateKosService = async (ownerId, kosId, data) => {
    const payload = {};
    for (const key of ALLOWED_KOS_UPDATE_FIELDS) {
        if (data?.[key] !== undefined) {
            payload[key] = key === 'fasilitas' ? normalizeFacilities(data[key]) : data[key];
        }
    }
    if (
        payload.jumlahKamarTersedia !== undefined &&
        payload.jumlahKamar !== undefined &&
        Number(payload.jumlahKamarTersedia) > Number(payload.jumlahKamar)
    ) {
        payload.jumlahKamarTersedia = Number(payload.jumlahKamar);
    }
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $set: payload },
        { new: true }
    );
};

export const deleteKosService = async (ownerId, kosId) => {
    const deletedKos = await Kos.findOneAndDelete({ _id: kosId, ownerId });
    if (!deletedKos) return null;
    await cascadeDeleteKosRecords(deletedKos);
    return deletedKos;
};

export const updateAvailabilityService = async (ownerId, kosId, jumlahKamarTersedia) => {
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $set: { jumlahKamarTersedia } },
        { new: true }
    );
};

export const submitKosForVerificationService = async (ownerId, kosId) => {
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $set: { statusVerifikasi: 'Pending' } },
        { new: true }
    );
};

export const getKosStatusService = async (ownerId, kosId) => {
    return await Kos.findOne({ _id: kosId, ownerId }).select('nama statusVerifikasi alasanPenolakan');
};

export const addKosImagesService = async (ownerId, kosId, imageUrls) => {
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $push: { fotoUrls: { $each: imageUrls } } },
        { new: true }
    );
};

export const removeKosImageService = async (ownerId, kosId, imageUrl) => {
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $pull: { fotoUrls: imageUrl } },
        { new: true }
    );
};