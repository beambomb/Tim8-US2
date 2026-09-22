import Kos from '../models/Kos.js';
import User from '../models/User.js';

export const getPendingSubmissions = async (req, res) => {
    try {
        const submissions = await Kos.find({ statusVerifikasi: 'Pending' });

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar pengajuan kos berstatus Pending',
            total: submissions.length,
            data: submissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pengajuan kos',
            error: error.message,
        });
    }
};

export const getSubmissionDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const kos = await Kos.findById(id);

        if (!kos) {
            return res.status(404).json({
                success: false,
                message: `Kos dengan ID ${id} tidak ditemukan`,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail pengajuan kos',
            data: kos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kos',
            error: error.message,
        });
    }
};

export const approveSubmission = async (req, res) => {
    try {
        const { id } = req.params;

        const kos = await Kos.findByIdAndUpdate(
            id,
            {
                statusVerifikasi: 'Approved',
                alasanPenolakan: null,
            },
            { new: true }
        );

        if (!kos) {
            return res.status(404).json({
                success: false,
                message: `Kos dengan ID ${id} tidak ditemukan`,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pengajuan kos berhasil disetujui (Approved)',
            data: kos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menyetujui pengajuan kos',
            error: error.message,
        });
    }
};

export const rejectSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { alasanPenolakan } = req.body;

        if (!alasanPenolakan) {
            return res.status(400).json({
                success: false,
                message: 'Alasan penolakan wajib diisi',
            });
        }

        const kos = await Kos.findByIdAndUpdate(
            id,
            {
                statusVerifikasi: 'Rejected',
                alasanPenolakan: alasanPenolakan,
            },
            { new: true }
        );

        if (!kos) {
            return res.status(404).json({
                success: false,
                message: `Kos dengan ID ${id} tidak ditemukan`,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pengajuan kos berhasil ditolak',
            data: kos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menolak pengajuan kos',
            error: error.message,
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['PENCARI_KOS', 'PEMILIK_KOS', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role tidak valid! Pilihan: ${validRoles.join(', ')}`,
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User dengan ID ${id} tidak ditemukan`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Role pengguna berhasil diubah menjadi ${role}`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengubah role pengguna',
            error: error.message,
        });
    }
};
