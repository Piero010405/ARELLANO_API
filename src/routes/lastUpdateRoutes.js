// src/routes/lastUpdateRoutes.js
import express from "express";
import { lastUpdateE2eController } from "../controllers/lastUpdateController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/e2e", requireAuth, lastUpdateE2eController);

export default router;