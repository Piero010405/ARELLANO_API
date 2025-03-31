import express from 'express';
import { postProyeccion } from '../controllers/proyeccionesController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, postProyeccion);

export default router;
