// src/routes/passwordResetRoutes.js
import express from "express";
import { requestReset, resetPassword } from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/request-reset", requestReset);
router.post("/reset-password", resetPassword);

export default router;
