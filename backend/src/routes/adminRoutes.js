import express from 'express';
import {
    getPendingSubmissions,
    getSubmissionDetail,
    approveSubmission,
    rejectSubmission,
    updateUserRole,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/submissions', getPendingSubmissions);

router.get('/submissions/:id', getSubmissionDetail);

router.patch('/submissions/:id/approve', approveSubmission);

router.patch('/submissions/:id/reject', rejectSubmission);

router.patch('/users/:id/role', updateUserRole);

export default router;
