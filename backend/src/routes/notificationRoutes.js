import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getUserNotifications);
router.patch('/:id/read', verifyToken, markNotificationAsRead);

export default router;
