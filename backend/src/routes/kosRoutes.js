import express from 'express';
import {
  getAllKos,
  getKosById,
  getNearbyKos,
  searchCampuses
} from '../controllers/kosController.js';
import {
  createReview,
  getKosReviews
} from '../controllers/reviewController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllKos);
router.get('/campuses', searchCampuses);
router.get('/nearby', getNearbyKos);
router.get('/:id', getKosById);

router.post('/:id/reviews', verifyToken, authorizeRoles('PENCARI_KOS'), createReview);
router.get('/:id/reviews', getKosReviews);

export default router;