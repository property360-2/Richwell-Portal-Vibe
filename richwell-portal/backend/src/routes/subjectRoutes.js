
// ============================================

// backend/src/routes/subjectRoutes.js
import express from 'express';
import {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllSubjects);
router.get('/:id', protect, getSubject);
router.post('/', protect, authorize('dean', 'registrar'), createSubject);
router.put('/:id', protect, authorize('dean', 'registrar'), updateSubject);
router.delete('/:id', protect, authorize('dean'), deleteSubject);

export default router;

