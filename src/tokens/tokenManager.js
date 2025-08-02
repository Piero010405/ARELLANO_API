// src/tokens/tokenManager.js
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { getConnection } from '../database/connection.js';
import dotenv from 'dotenv';
dotenv.config();

// * TOKENS GENERATION
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  const pool = await getConnection();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de expiración

  await pool.request()
    .input('user_id', sql.Int, payload.id)
    .input('token', sql.NVarChar(sql.MAX), refreshToken)
    .input('expires_at', sql.DateTime, expiresAt)
    .query(`
      INSERT INTO REFRESH_TOKENS (user_id, token, expires_at)
      VALUES (@user_id, @token, @expires_at)
    `);

  return refreshToken;
};

// * TOKENS VERIFICATION
export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET_ACCESS);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_SECRET_REFRESH);

// * TOKENS MANAGEMENT
export const isRefreshTokenValid = async (refreshToken) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('token', sql.NVarChar(sql.MAX), refreshToken)
    .query(`
      SELECT * FROM REFRESH_TOKENS
      WHERE token = @token AND expires_at > GETDATE()
    `);
  
  if (result.recordset.length === 0) return false;
  return true;
};

export const invalidateRefreshToken = async (refreshToken) => {
  const pool = await getConnection();
  await pool.request()
    .input('token', sql.NVarChar(sql.MAX), refreshToken)
    .query(`
      DELETE FROM REFRESH_TOKENS WHERE token = @token
    `);
};

export const blackListedAccessToken = async (accessToken) => {
  const pool = await getConnection();
  const expiresInSeconds = 15 * 60;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  await pool.request()
    .input('token', sql.NVarChar(sql.MAX), accessToken)
    .input('expires_at', sql.DateTime, expiresAt)
    .query(`
      INSERT INTO BLACKLISTED_TOKENS (token, expires_at)
      VALUES (@token, @expires_at)
    `);
};

export const isTokenBlacklisted = async (token) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('token', sql.NVarChar(sql.MAX), token)
    .query(`
      SELECT * FROM BLACKLISTED_TOKENS
      WHERE token = @token AND expires_at > GETDATE()
    `);

  if (result.recordset.length === 0) return false;
  return true;
};

// Eliminar todos los `refreshTokens` previos del usuario
export async function invalidateUserRefreshTokens(userId) {
  const pool = await getConnection();
  await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`
      DELETE FROM REFRESH_TOKENS WHERE user_id = @user_id
    `);
}