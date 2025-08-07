import express from "express";
import { metricasController } from "../controllers/metricasController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, metricasController);

export default router;