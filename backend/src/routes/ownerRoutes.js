import express from 'express';
import {
  getOwnerKos,
  createKos,
  updateKos,
  deleteKos,
  updateAvailability,
  submitKosForVerification,
  getKosStatus
} from '../controllers/ownerController.js';

const router = express.Router();

// Route untuk manajemen data kos utama (GET, POST, PUT, DELETE)
router.get('/kos', getOwnerKos);
router.post('/kos', createKos);
router.put('/kos/:id', updateKos);
router.delete('/kos/:id', deleteKos);

// Route untuk fitur spesifik pemilik kos
router.patch('/kos/:id/availability', updateAvailability);
router.post('/kos/:id/submit', submitKosForVerification);
router.get('/kos/:id/status', getKosStatus);

export default router;