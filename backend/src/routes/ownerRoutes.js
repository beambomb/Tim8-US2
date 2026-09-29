import express from 'express';
import {
  getOwnerKos,
  createKos,
  updateKos,
  deleteKos,
  updateAvailability,
  submitKosForVerification,
  getKosStatus,
  uploadImages,
  uploadKosImages,
  deleteKosImage
} from '../controllers/ownerController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('PEMILIK_KOS'));

router.get('/kos', getOwnerKos);
router.post('/kos', createKos);
router.put('/kos/:id', updateKos);
router.delete('/kos/:id', deleteKos);

router.patch('/kos/:id/availability', updateAvailability);
router.post('/kos/:id/submit', submitKosForVerification);
router.get('/kos/:id/status', getKosStatus);

router.post('/upload', upload.array('images', 5), uploadImages);
router.post('/kos/:id/images', upload.array('images', 5), uploadKosImages);
router.delete('/kos/:id/images', deleteKosImage);

export default router;