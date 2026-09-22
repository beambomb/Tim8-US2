import Kos from '../models/Kos.js';
import User from '../models/User.js';

export const fetchPendingSubmissions = async () => {
    return await Kos.find({ statusVerifikasi: 'Pending' });
};

export const fetchSubmissionById = async (id) => {
    return await Kos.findById(id);
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
