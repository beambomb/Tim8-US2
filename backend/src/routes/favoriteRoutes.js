import express from 'express';
import {
  getFavorites,
  addFavorite,
  deleteFavorite
} from '../controllers/favoriteController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua endpoint favorit membutuhkan login
router.get('/', verifyToken, getFavorites);
router.post('/', verifyToken, addFavorite);
router.delete('/:id', verifyToken, deleteFavorite);

export default router;