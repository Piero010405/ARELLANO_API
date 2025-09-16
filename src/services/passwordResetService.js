// src/services/passwordResetService.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import resend from "../config/mailer.js";
import React from "react";
import { render } from "@react-email/render";
import { ResetPasswordEmail } from "../emails/ResetPasswordEmail.js";
import * as PasswordResetModel from "../models/passwordResetModel.js";
import { API_ENDPOINTS } from "../utils/consts.js";
import { API_ENDPOINTS_RATE_LIMIT } from "../utils/consts.js";
import { TIME_LIMITS } from "../utils/consts.js";

export async function requestPasswordReset(email) {
  try {
    const user = await PasswordResetModel.findUserByEmail(email);

    if (!user) {
      return { success: false, message: "No existe un usuario asociado a este correo." };
    }
    
    const { SUPERVISOR_ID, NOMBRE } = user;

    const otp = crypto.randomInt(100000, 999999).toString(); // código 6 dígitos
    const expiresAt = new Date(Date.now() + TIME_LIMITS.RESET_PASSWORD); // 10 min

    // * Validamos el RATE LIMIT
    const requestLog = await PasswordResetModel.validateRequestLog(SUPERVISOR_ID, API_ENDPOINTS.RESET_PASSWORD);
    
    if (requestLog >= API_ENDPOINTS_RATE_LIMIT.RESET_PASSWORD) {
      return { success: false, message: "Has alcanzado el límite de solicitudes de restablecimiento de contraseña." };
    }
    
    // * Creamos el token
    await PasswordResetModel.createResetToken(SUPERVISOR_ID, otp, expiresAt);
    // * Creamos el log de la solicitud
    await PasswordResetModel.createRequestLog(SUPERVISOR_ID, API_ENDPOINTS.RESET_PASSWORD);

    // * Generamos HTML y texto a partir del componente React
    // * Render sin JSX
    const emailHtml = await render(
      React.createElement(ResetPasswordEmail, { name: NOMBRE, otp, expiresAt })
    );

    const emailText = await render(
      React.createElement(ResetPasswordEmail, { name: NOMBRE, otp, expiresAt }),
      { plainText: true }
    );

    // * Envío de correo con Resend
    const result = await resend.emails.send({
      // from: `Soporte Arellano <soporte@apiauditoria.arellano.pe>`, // dominio verificado en Resend
      from: `Soporte Arellano <onboarding@resend.dev>`, // dominio verificado en Resend
      //to: email,
      to: "piero.arellano.2004@gmail.com",
      subject: "Restablecer contraseña - Arellano Auditoría",
      html: emailHtml,
      text: emailText,
    });

    if (result.error) {
      return { success: false, message: `Error al enviar correo: ${result.error}` };
    }
    
    return { success: true, expiresAt };
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    return {
      success: false,
      message: "Hubo un error interno al procesar la solicitud de restablecimiento.",
      details: error.message, // opcional, para debugging
    };
  }
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
