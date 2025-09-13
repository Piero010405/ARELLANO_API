// src/controllers/passwordResetController.js
import * as passwordResetService from "../services/passwordResetService.js";

export async function requestReset(req, res) {
  try {
    const { email } = req.body;
    const result = await passwordResetService.requestPasswordReset(email);

    if (!result.success) {
      // errores esperados (usuario no existe, error al enviar correo)
      return res.status(400).json(result);
    }

    // éxito
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error en requestReset:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
    });
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
