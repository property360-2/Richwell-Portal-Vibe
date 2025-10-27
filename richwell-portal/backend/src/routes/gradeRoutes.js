// backend/src/routes/gradeRoutes.js
import express from 'express';
import { 
  getProfessorSections,
  updateGrade,
  getPendingGrades,
  approveGrade,
  bulkApproveGrades
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Professor routes
router.get('/sections', authorize('professor'), getProfessorSections);
router.put('/:enrollmentSubjectId', authorize('professor'), updateGrade);

// Registrar routes
router.get('/pending-approval', authorize('registrar'), getPendingGrades);
router.put('/:gradeId/approve', authorize('registrar'), approveGrade);
router.put('/bulk-approve', authorize('registrar'), bulkApproveGrades);

export default router;
