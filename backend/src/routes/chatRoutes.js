import express from 'express';
import {
  getConversation,
  getInboxList,
  getSupportContact,
  sendMessageHttp,
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seluruh rute chat membutuhkan token login
router.use(verifyToken);

router.get('/inbox', getInboxList);
router.get('/support', getSupportContact);
router.get('/:userId', getConversation);
router.post('/send', sendMessageHttp);

export default router;
