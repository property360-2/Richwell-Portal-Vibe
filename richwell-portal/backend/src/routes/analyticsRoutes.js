// backend/src/routes/analyticsRoutes.js
import express from 'express';
import {
  getStudentAnalytics,
  getProfessorAnalytics,
  getRegistrarAnalytics,
  getDeanAnalytics,
  getAdmissionAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Role-based analytics routes
router.get('/student', authorize('student'), getStudentAnalytics);
router.get('/professor', authorize('professor'), getProfessorAnalytics);
router.get('/registrar', authorize('registrar'), getRegistrarAnalytics);
router.get('/dean', authorize('dean'), getDeanAnalytics);
router.get('/admission', authorize('admission', 'registrar', 'dean'), getAdmissionAnalytics);

export default router;
