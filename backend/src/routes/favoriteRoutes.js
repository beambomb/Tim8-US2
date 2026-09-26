import express from 'express';
import {
  getFavorites,
  addFavorite,
  deleteFavorite
} from '../controllers/favoriteController.js';
import {
  verifyToken,
  authorizeRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua endpoint favorit membutuhkan login dan hanya dapat diakses Pencari Kos
router.get(
  '/',
  verifyToken,
  authorizeRoles('PENCARI_KOS'),
  getFavorites
);

router.post(
  '/',
  verifyToken,
  authorizeRoles('PENCARI_KOS'),
  addFavorite
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('PENCARI_KOS'),
  deleteFavorite
);

export default router;
