// backend/src/routes/professorRoutes.js
import express from 'express';
import {
  getAllProfessors,
  getProfessor,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  getProfessorSections
} from '../controllers/professorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all professors (Registrar, Dean)
router.get('/', authorize('registrar', 'dean'), getAllProfessors);

// Get single professor (Registrar, Dean, Professor)
router.get('/:id', authorize('registrar', 'dean', 'professor'), getProfessor);

// Create professor (Registrar, Dean)
router.post('/', authorize('registrar', 'dean'), createProfessor);

// Update professor (Registrar, Dean, Professor)
router.put('/:id', authorize('registrar', 'dean', 'professor'), updateProfessor);

// Delete professor (Dean only)
router.delete('/:id', authorize('dean'), deleteProfessor);

// Get professor's sections (Registrar, Dean, Professor)
router.get('/:id/sections', authorize('registrar', 'dean', 'professor'), getProfessorSections);

export default router;
