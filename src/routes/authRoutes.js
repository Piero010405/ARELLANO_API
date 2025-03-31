// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController, refreshTokenController, validateTokenController } from '../controllers/authController.js';
import { authenticateRefreshToken, authenticateLogout, authenticateAccessToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', authenticateLogout, logoutController);
router.post('/refresh-token', authenticateRefreshToken, refreshTokenController);
router.get("/validate", authenticateAccessToken, validateTokenController);

export default router;