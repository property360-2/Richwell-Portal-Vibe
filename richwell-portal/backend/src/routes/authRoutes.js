// backend/src/routes/authRoutes.js
import express from 'express';
import { 
  login, 
  logout, 
  getMe, 
  changePassword,
  setupPassword 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/setup-password', setupPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

export default router;