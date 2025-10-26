// backend/src/routes/repeatEligibilityRoutes.js
import express from 'express';
import { 
  checkRepeatEligibility,
  getAllStudentsRepeatEligibility,
  updateRepeatEligibilityDate
} from '../controllers/repeatEligibilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Check repeat eligibility for specific student
router.get('/:studentId', checkRepeatEligibility);

// Get all students with repeat eligibility (Registrar/Dean)
router.get('/', getAllStudentsRepeatEligibility);

// Update repeat eligibility date (Registrar/Dean)
router.put('/:gradeId', updateRepeatEligibilityDate);

export default router;
