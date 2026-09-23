import express from 'express';
import {
    getPendingSubmissions,
    getSubmissionDetail,
    approveSubmission,
    rejectSubmission,
    updateUserRole,
    getAllUsers,
    getAdminStats,
} from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lindungi seluruh endpoint admin: hanya user login dengan role ADMIN yang bisa akses
router.use(verifyToken, authorizeRoles('ADMIN'));

// Statistik Dashboard Admin
router.get('/stats', getAdminStats);

// Manajemen Data Pengguna
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

// Verifikasi Pengajuan Kos
router.get('/submissions', getPendingSubmissions);
router.get('/submissions/:id', getSubmissionDetail);
router.patch('/submissions/:id/approve', approveSubmission);
router.patch('/submissions/:id/reject', rejectSubmission);

export default router;
