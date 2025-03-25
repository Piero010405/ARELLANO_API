// src/tokens/tokenManager.js
import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = async (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Guardamos el refresh token en Redis (7 días)
  await redisClient.set(refreshToken, JSON.stringify(payload), {
    EX: 7 * 24 * 60 * 60, // Expira en 7 días
  });

  return refreshToken;
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const invalidateRefreshToken = async (refreshToken) => {
  await redisClient.del(refreshToken);
};

export const isRefreshTokenValid = async (refreshToken) => {
  const exists = await redisClient.exists(refreshToken);
  return exists === 1;
};