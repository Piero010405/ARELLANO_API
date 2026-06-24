import express from "express";
import {
  storesController,
  storesByIdController,
  storesFaltantesController,
  storesProyectadasController,
} from "../controllers/storesController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, storesController);
router.get("/stores-faltantes", requireAuth, storesFaltantesController);
router.get("/stores-proyectadas", requireAuth, storesProyectadasController);
router.get("/:id", requireAuth, storesByIdController);

export default router;