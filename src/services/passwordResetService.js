// src/services/passwordResetService.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import transporter from "../config/mailer.js";
import { resetPasswordEmail } from "../utils/emailTemplates.js";
import * as PasswordResetModel from "../models/passwordResetModel.js";

export async function requestPasswordReset(email) {
  const user = await PasswordResetModel.findUserByEmail(email);

  if (!user) {
    throw new Error("No existe un usuario asociado a este correo.");
  }
  
  const { SUPERVISOR_ID, NOMBRE } = user;

  const otp = crypto.randomInt(100000, 999999).toString(); // código 6 dígitos
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await PasswordResetModel.createResetToken(SUPERVISOR_ID, otp, expiresAt);

  const mailOptions = resetPasswordEmail(NOMBRE, otp, expiresAt.toLocaleTimeString());
  await transporter.sendMail({
    from: `"Soporte Arellano" <${process.env.OUTLOOK_USER}>`,
    to: email,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
  });

  return { success: true, expiresAt };
}

export async function resetPassword(token, newPassword) {
  const record = await PasswordResetModel.findToken(token);

  if (!record) throw new Error("Token inválido.");
  if (new Date(record.EXPIRES_AT) < new Date()) {
    await PasswordResetModel.deleteToken(token);
    throw new Error("El token ha expirado.");
  }

  // Encriptar la nueva contraseña
  const hash = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña
  await PasswordResetModel.updatePassword(hash, record.SUPERVISOR_ID);

  // Eliminamos el token
  await PasswordResetModel.deleteToken(token);

  return { success: true };
}
