import express from 'express';
import {
  getAllKos,
  getKosById,
  getNearbyKos
} from '../controllers/kosController.js';
import {
  createReview,
  getKosReviews
} from '../controllers/reviewController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllKos);
router.get('/nearby', getNearbyKos);
router.get('/:id', getKosById);

router.post('/:id/reviews', verifyToken, authorizeRoles('PENCARI_KOS'), createReview);
router.get('/:id/reviews', getKosReviews);

export default router;