// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController, refreshTokenController } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/refresh-token', refreshTokenController);

export default router;