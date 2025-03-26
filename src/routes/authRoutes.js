// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController, refreshTokenController } from '../controllers/authController.js';
import { authenticateRefreshToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/refresh-token', authenticateRefreshToken, refreshTokenController);

export default router;