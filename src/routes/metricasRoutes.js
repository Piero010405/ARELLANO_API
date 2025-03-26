import express from "express";
import { metricasController } from "../controllers/metricasController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, metricasController);

export default router;