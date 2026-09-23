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

// Import middleware pengamanan
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Terapkan perlindungan autentikasi dan otorisasi
router.use(verifyToken);
router.use(authorizeRoles('PEMILIK_KOS'));

router.get('/kos', getOwnerKos);
router.post('/kos', createKos);
router.put('/kos/:id', updateKos);
router.delete('/kos/:id', deleteKos);

router.patch('/kos/:id/availability', updateAvailability);
router.post('/kos/:id/submit', submitKosForVerification);
router.get('/kos/:id/status', getKosStatus);

export default router;