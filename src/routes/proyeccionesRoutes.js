import express from 'express';
import { postProyeccion } from '../controllers/proyeccionesController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', requireAuth, postProyeccion);

export default router;
