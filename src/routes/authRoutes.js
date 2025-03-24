// src/routes/authRoutes.js
import express from 'express';
import { loginController, logoutController } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/logout', logoutController);

export default router;
