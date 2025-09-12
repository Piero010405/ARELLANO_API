// src/services/passwordResetService.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import resend from "../config/mailer.js";
import React from "react";
import { render } from "@react-email/render";
import { ResetPasswordEmail } from "../emails/ResetPasswordEmail.jsx";
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

  // * Generamos HTML y texto a partir del componente React
  // * Render sin JSX
  const emailHtml = render(
    React.createElement(ResetPasswordEmail, {
      name: NOMBRE,
      otp,
      expiresAt,
    })
  );

  const emailText = render(
    React.createElement(ResetPasswordEmail, {
      name: NOMBRE,
      otp,
      expiresAt,
    }),
    { plainText: true }
  );

  // * Envío de correo con Resend
  await resend.emails.send({
    // from: `Soporte Arellano <soporte@apiauditoria.arellano.pe>`, // dominio verificado en Resend
    from: `Soporte Arellano <onboarding@resend.dev>`, // dominio verificado en Resend
    to: email,
    subject: "Restablecer contraseña - Arellano Auditoría",
    html: emailHtml,
    text: emailText,
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
