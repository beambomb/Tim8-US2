import express from 'express';
import {
  getAllKos,
  getKosById,
  getNearbyKos
} from '../controllers/kosController.js';

const router = express.Router();

router.get('/', getAllKos);
router.get('/nearby', getNearbyKos);
router.get('/:id', getKosById);

export default router;