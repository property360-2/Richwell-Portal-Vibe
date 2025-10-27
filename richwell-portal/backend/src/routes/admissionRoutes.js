// backend/src/routes/admissionRoutes.js
import express from 'express';
import { onboardStudent } from '../controllers/admissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/students', authorize('admission', 'registrar'), onboardStudent);

export default router;
