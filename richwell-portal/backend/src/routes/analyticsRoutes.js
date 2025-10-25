// backend/src/routes/analyticsRoutes.js
import express from 'express';
import { 
  getStudentAnalytics,
  getProfessorAnalytics,
  getRegistrarAnalytics,
  getDeanAnalytics
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Role-based analytics routes
router.get('/student', getStudentAnalytics);
router.get('/professor', getProfessorAnalytics);
router.get('/registrar', getRegistrarAnalytics);
router.get('/dean', getDeanAnalytics);

export default router;
