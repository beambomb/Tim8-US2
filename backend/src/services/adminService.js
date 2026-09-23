import Kos from '../models/Kos.js';
import User from '../models/User.js';

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
