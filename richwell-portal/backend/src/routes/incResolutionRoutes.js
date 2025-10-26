// backend/src/routes/incResolutionRoutes.js
import express from 'express';
import { 
  getStudentIncSubjects,
  getProfessorIncResolutions,
  createIncResolution,
  getPendingIncResolutions,
  approveIncResolution,
  bulkApproveIncResolutions
} from '../controllers/incResolutionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/student', getStudentIncSubjects);

// Professor routes
router.get('/professor', getProfessorIncResolutions);
router.post('/', createIncResolution);

// Registrar routes
router.get('/pending', getPendingIncResolutions);
router.put('/:resolutionId/approve', approveIncResolution);
router.put('/bulk-approve', bulkApproveIncResolutions);

export default router;
