import Kos from '../models/Kos.js';
import User from '../models/User.js';
import {
    cascadeDeleteKosRecords,
    cascadeDeleteUserById,
} from './deletionService.js';

export const fetchPendingSubmissions = async () => {
    return await Kos.find({ statusVerifikasi: 'Pending' })
        .populate('ownerId', 'nama email noHp');
};

export const fetchSubmissionById = async (id) => {
    return await Kos.findById(id)
        .populate('ownerId', 'nama email noHp');
};

export const approveKosSubmission = async (id) => {
    return await Kos.findByIdAndUpdate(
        id,
        { statusVerifikasi: 'Approved', alasanPenolakan: null },
        { new: true }
    );
};

export const rejectKosSubmission = async (id, alasan) => {
    return await Kos.findByIdAndUpdate(
        id,
        { statusVerifikasi: 'Rejected', alasanPenolakan: alasan },
        { new: true }
    );
};

export const changeUserRole = async (id, newRole) => {
    return await User.findByIdAndUpdate(
        id,
        { role: newRole },
        { new: true }
    ).select('-password');
};

export const fetchAllUsers = async () => {
    return await User.find().select('-password');
};

export const fetchAllKos = async (filters = {}) => {
    const query = {};
    if (filters.status) {
        query.statusVerifikasi = filters.status;
    }
    if (filters.tipe) {
        query.tipe = filters.tipe;
    }
    if (filters.search && String(filters.search).trim()) {
        const escapedSearch = String(filters.search)
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearch, 'i');
        query.$or = [{ nama: regex }, { lokasi: regex }];
    }

    return await Kos.find(query)
        .populate('ownerId', 'nama email noHp')
        .sort({ createdAt: -1 });
};

export const deleteKosById = async (id) => {
    const deletedKos = await Kos.findByIdAndDelete(id);
    if (!deletedKos) return null;
    await cascadeDeleteKosRecords(deletedKos);
    return deletedKos;
};

export const deleteUserById = async (id) => {
    return await cascadeDeleteUserById(id);
};

export const fetchAdminStats = async () => {
    const [
        totalUsers,
        totalPencari,
        totalPemilik,
        totalAdmin,
        totalKos,
        pendingKos,
        approvedKos,
        rejectedKos,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'PENCARI_KOS' }),
        User.countDocuments({ role: 'PEMILIK_KOS' }),
        User.countDocuments({ role: 'ADMIN' }),
        Kos.countDocuments(),
        Kos.countDocuments({ statusVerifikasi: 'Pending' }),
        Kos.countDocuments({ statusVerifikasi: 'Approved' }),
        Kos.countDocuments({ statusVerifikasi: 'Rejected' }),
    ]);

    return {
        users: {
            total: totalUsers,
            pencari: totalPencari,
            pemilik: totalPemilik,
            admin: totalAdmin,
        },
        kos: {
            total: totalKos,
            pending: pendingKos,
            approved: approvedKos,
            rejected: rejectedKos,
        },
    };
};
