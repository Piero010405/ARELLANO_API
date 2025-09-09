// src/services/passwordResetService.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import transporter from "../config/mailer.js";
import { resetPasswordEmail } from "../utils/emailTemplates.js";
import * as PasswordResetModel from "../models/passwordResetModel.js";
import db from "../database/connection.js";
import sql from "mssql";

export async function requestPasswordReset(email) {
  const pool = await db.getConnection();
  const user = await pool.request()
    .input("EMAIL", sql.NVarChar(255), email)
    .query("SELECT SUPERVISOR_ID, NOMBRE FROM [dbo].[AS] WHERE EMAIL = @EMAIL");

  if (!user.recordset[0]) {
    throw new Error("No existe un usuario asociado a este correo.");
  }

  const { SUPERVISOR_ID, NOMBRE } = user.recordset[0];

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

  const hash = await bcrypt.hash(newPassword, 10);

  const pool = await db.getConnection();
  await pool.request()
    .input("SUPERVISOR_ID", sql.Int, record.SUPERVISOR_ID)
    .input("PASSWORD", sql.NVarChar(255), hash)
    .query("UPDATE [dbo].[AS] SET PASSWORD = @PASSWORD WHERE SUPERVISOR_ID = @SUPERVISOR_ID");

  await PasswordResetModel.deleteToken(token);

  return { success: true };
}
