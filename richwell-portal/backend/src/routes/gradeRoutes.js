// backend/src/routes/gradeRoutes.js
import express from 'express';
import { 
  getProfessorSections,
  updateGrade,
  getPendingGrades,
  approveGrade,
  bulkApproveGrades
} from '../controllers/gradeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Professor routes
router.get('/sections', getProfessorSections);
router.put('/:enrollmentSubjectId', updateGrade);

// Registrar routes
router.get('/pending-approval', getPendingGrades);
router.put('/:gradeId/approve', approveGrade);
router.put('/bulk-approve', bulkApproveGrades);

export default router;
