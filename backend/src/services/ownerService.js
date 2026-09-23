import Kos from '../models/Kos.js';

export const getOwnerKosService = async (ownerId) => {
    return await Kos.find({ ownerId });
};

export const createKosService = async (ownerId, data) => {
    const newKos = new Kos({
        ...data,
        ownerId,
        jumlahKamarTersedia: data.jumlahKamar,
        statusVerifikasi: 'Pending'
    });
    return await newKos.save();
};

export const updateKosService = async (ownerId, kosId, data) => {
    return await Kos.findOneAndUpdate(
        { _id: kosId, ownerId },
        { $set: data },
        { new: true }
    );
};

export const deleteKosService = async (ownerId, kosId) => {
    return await Kos.findOneAndDelete({ _id: kosId, ownerId });
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