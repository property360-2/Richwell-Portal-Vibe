
// backend/src/routes/sectionRoutes.js
import express from 'express';
import {
  getAllSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllSections);
router.get('/:id', protect, getSection);
router.post('/', protect, authorize('registrar', 'dean'), createSection);
router.put('/:id', protect, authorize('registrar', 'dean'), updateSection);
router.delete('/:id', protect, authorize('dean'), deleteSection);

export default router;