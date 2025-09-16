// middlewares/validateRequest.js
import { validatePassword } from "../utils/validators.js";

/**
 * Middleware para validar contraseñas en peticiones de resetPassword
 */
export function validatePasswordMiddleware(req, res, next) {
  const { newPassword } = req.body;

  const { valid, errors } = validatePassword(newPassword, {
    username: req.user?.username,
    email: req.user?.email,
  });

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "La contraseña no cumple con los requisitos de seguridad",
      errors,
    });
  }

  next();
}
