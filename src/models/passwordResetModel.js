// src/models/passwordResetModel.js
import sql from "mssql";
import db from "../database/connection.js";

export async function createResetToken(supervisorId, token, expiresAt) {
  const pool = await db.getConnection();
  await pool.request()
    .input("SUPERVISOR_ID", sql.Int, supervisorId)
    .input("TOKEN", sql.NVarChar(10), token)
    .input("EXPIRES_AT", sql.DateTime, expiresAt)
    .query(`
      INSERT INTO PasswordResetTokens (SUPERVISOR_ID, TOKEN, EXPIRES_AT)
      VALUES (@SUPERVISOR_ID, @TOKEN, @EXPIRES_AT)
    `);
}

export async function findToken(token) {
  const pool = await db.getConnection();
  const result = await pool.request()
    .input("TOKEN", sql.NVarChar(10), token)
    .query("SELECT * FROM PasswordResetTokens WHERE TOKEN = @TOKEN");
  return result.recordset[0];
}

export async function deleteToken(token) {
  const pool = await db.getConnection();
  await pool.request()
    .input("TOKEN", sql.NVarChar(10), token)
    .query("DELETE FROM PasswordResetTokens WHERE TOKEN = @TOKEN");
}
