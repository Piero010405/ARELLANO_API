// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController, refreshTokenController, validateTokenController } from '../controllers/authController.js';
import { requireAuth,authenticateRefreshToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', requireAuth, logoutController);
router.post('/refresh-token', authenticateRefreshToken, refreshTokenController);
router.get("/validate", requireAuth, validateTokenController);

export default router;