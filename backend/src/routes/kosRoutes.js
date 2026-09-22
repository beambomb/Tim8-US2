import express from 'express';
import {
  getAllKos,
  getKosById
} from '../controllers/kosController.js';

const router = express.Router();

router.get('/', getAllKos);
router.get('/:id', getKosById);

export default router;