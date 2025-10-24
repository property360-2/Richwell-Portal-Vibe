// backend/src/routes/programRoutes.js
import express from 'express';
import {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
} from '../controllers/programController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllPrograms);
router.get('/:id', protect, getProgram);
router.post('/', protect, authorize('dean', 'registrar'), createProgram);
router.put('/:id', protect, authorize('dean', 'registrar'), updateProgram);
router.delete('/:id', protect, authorize('dean'), deleteProgram);

export default router;


