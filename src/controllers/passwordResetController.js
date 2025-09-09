// src/controllers/passwordResetController.js
import * as passwordResetService from "../services/passwordResetService.js";

export async function requestReset(req, res) {
  try {
    const { email } = req.body;
    const result = await passwordResetService.requestPasswordReset(email);
    res.json({ message: "Correo enviado", expiresAt: result.expiresAt });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    await passwordResetService.resetPassword(token, newPassword);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
