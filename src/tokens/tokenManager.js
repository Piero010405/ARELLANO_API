// src/tokens/tokenManager.js
import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient.js';
import dotenv from 'dotenv';
dotenv.config();

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  await redisClient.set(refreshToken, JSON.stringify(payload), { EX: 7 * 24 * 60 * 60 }); // Expira en 7 días
  return refreshToken;
};

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET_ACCESS);
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_SECRET_REFRESH);

export const invalidateRefreshToken = async (refreshToken) => {
  await redisClient.del(refreshToken);
};

export const blackListedAccessToken = async (accessToken) => {
  await redisClient.set(accessToken, 'blacklisted', { EX: 15 * 60 });
};

export const isTokenBlacklisted = async (token) => {
  const exists = await redisClient.exists(token);
  return exists === 1;
};

export const isRefreshTokenValid = async (refreshToken) => {
  const exists = await redisClient.exists(refreshToken);
  return exists === 1;
};

// Eliminar todos los `refreshTokens` previos del usuario
export async function invalidateUserRefreshTokens(userId) {
  await redis.del(`refreshToken:${userId}`);
}