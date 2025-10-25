// backend/src/routes/enrollmentRoutes.js
import express from 'express';
import { 
  getAvailableSubjects,
  getRecommendedSubjects,
  enrollStudent,
  getEnrollmentHistory,
  cancelEnrollment
} from '../controllers/enrollmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get available subjects for enrollment
router.get('/available-subjects', getAvailableSubjects);

// Get recommended subjects for student
router.get('/recommended-subjects', getRecommendedSubjects);

// Enroll student in subjects
router.post('/enroll', enrollStudent);

// Get student's enrollment history
router.get('/history', getEnrollmentHistory);

// Cancel enrollment
router.put('/:enrollmentId/cancel', cancelEnrollment);

export default router;
