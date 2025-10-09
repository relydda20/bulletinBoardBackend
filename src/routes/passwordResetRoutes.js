import express from 'express';
import { 
  forgotPassword, 
  resetPassword, 
  verifyResetToken 
} from '../controllers/passwordResetController.js';

const router = express.Router();

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', resetPassword);

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', verifyResetToken);

export default router;