import * as adminService from '../services/adminService.js';

export const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await adminService.fetchPendingSubmissions();
        res.status(200).json({ success: true, total: submissions.length, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSubmissionDetail = async (req, res) => {
    try {
        const kos = await adminService.fetchSubmissionById(req.params.id);
        if (!kos) return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
        res.status(200).json({ success: true, data: kos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveSubmission = async (req, res) => {
    try {
        const kos = await adminService.approveKosSubmission(req.params.id);
        if (!kos) return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
        res.status(200).json({ success: true, message: 'Pengajuan kos disetujui', data: kos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectSubmission = async (req, res) => {
    try {
        const { alasanPenolakan } = req.body;
        if (!alasanPenolakan) {
            return res.status(400).json({ success: false, message: 'Alasan penolakan wajib diisi' });
        }
        const kos = await adminService.rejectKosSubmission(req.params.id, alasanPenolakan);
        if (!kos) return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
        res.status(200).json({ success: true, message: 'Pengajuan kos ditolak', data: kos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['PENCARI_KOS', 'PEMILIK_KOS', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Role tidak valid!' });
        }
        const user = await adminService.changeUserRole(req.params.id, role);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.status(200).json({ success: true, message: `Role diubah menjadi ${role}`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.fetchAllUsers();
        res.status(200).json({ success: true, total: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const stats = await adminService.fetchAdminStats();
        res.status(200).json({ success: true, message: 'Berhasil mengambil statistik dashboard', data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
