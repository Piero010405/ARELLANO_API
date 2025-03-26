import express from 'express';
import { storesController } from '../controllers/storesController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/stores', authenticate, storesController);

export default router;