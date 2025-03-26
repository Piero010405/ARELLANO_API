import express from "express";
import { metricasController } from "../controllers/metricasController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, metricasController);

export default router;