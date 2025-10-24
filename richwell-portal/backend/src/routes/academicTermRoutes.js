
// backend/src/routes/academicTermRoutes.js
import express from 'express';
import {
  getAllTerms,
  getActiveTerm,
  getTerm,
  createTerm,
  updateTerm,
  setActiveTerm,
  deleteTerm
} from '../controllers/academicTermController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTerms);
router.get('/active', protect, getActiveTerm);
router.get('/:id', protect, getTerm);
router.post('/', protect, authorize('registrar', 'dean'), createTerm);
router.put('/:id', protect, authorize('registrar', 'dean'), updateTerm);
router.put('/:id/activate', protect, authorize('registrar', 'dean'), setActiveTerm);
router.delete('/:id', protect, authorize('dean'), deleteTerm);

export default router;