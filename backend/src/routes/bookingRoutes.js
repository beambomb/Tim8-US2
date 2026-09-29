import express from 'express';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
} from '../controllers/bookingController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('PENCARI_KOS'), createBooking);
router.get('/my', verifyToken, authorizeRoles('PENCARI_KOS'), getMyBookings);
router.patch('/:id/cancel', verifyToken, authorizeRoles('PENCARI_KOS'), cancelBooking);

router.get('/owner', verifyToken, authorizeRoles('PEMILIK_KOS'), getOwnerBookings);
router.patch('/owner/:id/approve', verifyToken, authorizeRoles('PEMILIK_KOS'), approveBooking);
router.patch('/owner/:id/reject', verifyToken, authorizeRoles('PEMILIK_KOS'), rejectBooking);
router.patch('/:id/approve', verifyToken, authorizeRoles('PEMILIK_KOS'), approveBooking);
router.patch('/:id/reject', verifyToken, authorizeRoles('PEMILIK_KOS'), rejectBooking);
router.patch('/:id/status', verifyToken, authorizeRoles('PEMILIK_KOS'), (req, res, next) => {
  if (req.body && req.body.status === 'Rejected') {
    return rejectBooking(req, res, next);
  }
  return approveBooking(req, res, next);
});
router.patch('/owner/:id/status', verifyToken, authorizeRoles('PEMILIK_KOS'), (req, res, next) => {
  if (req.body && req.body.status === 'Rejected') {
    return rejectBooking(req, res, next);
  }
  return approveBooking(req, res, next);
});

export default router;
