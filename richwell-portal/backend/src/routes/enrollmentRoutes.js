// backend/src/routes/enrollmentRoutes.js
import express from 'express';
import { 
  getAvailableSubjects,
  getRecommendedSubjects,
  enrollStudent,
  getEnrollmentHistory,
  cancelEnrollment
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get available subjects for enrollment
router.get('/available-subjects', authorize('student'), getAvailableSubjects);
router.get(
  '/students/:studentId/available-subjects',
  authorize('admission', 'registrar'),
  getAvailableSubjects
);

// Get recommended subjects for student
router.get('/recommended-subjects', authorize('student'), getRecommendedSubjects);
router.get(
  '/students/:studentId/recommended-subjects',
  authorize('admission', 'registrar'),
  getRecommendedSubjects
);

// Enroll student in subjects
router.post('/enroll', authorize('student'), enrollStudent);

// Get student's enrollment history
router.get('/history', authorize('student'), getEnrollmentHistory);
router.get(
  '/students/:studentId/history',
  authorize('admission', 'registrar'),
  getEnrollmentHistory
);

// Cancel enrollment
router.put('/:enrollmentId/cancel', authorize('student'), cancelEnrollment);

export default router;
