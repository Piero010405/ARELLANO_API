// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController, refreshTokenController } from '../controllers/authController.js';
import { authenticateRefreshToken, authenticateLogout } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', authenticateLogout, logoutController);
router.post('/refresh-token', authenticateRefreshToken, refreshTokenController);

export default router;