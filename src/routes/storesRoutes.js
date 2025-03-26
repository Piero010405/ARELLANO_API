import express from 'express';
import { storesController, storesByIdController, storesFaltantesController, storesProyectadasController } from '../controllers/storesController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, storesController);
router.get('/:id', authenticate, storesByIdController);
router.get('/stores-faltantes', authenticate, storesFaltantesController);
router.get('/stores-proyectadas', authenticate, storesProyectadasController);

export default router;