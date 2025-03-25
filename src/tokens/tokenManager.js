// src/tokens/tokenManager.js
import jwt from 'jsonwebtoken';
import redis from '../cache/redis.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  // Guardamos refresh en Redis
  redis.set(refreshToken, JSON.stringify(payload), 'EX', 7 * 24 * 60 * 60); // 7 días
  return refreshToken;
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const invalidateRefreshToken = async (refreshToken) => {
  await redis.del(refreshToken);
};

export const isRefreshTokenValid = async (refreshToken) => {
  const exists = await redis.exists(refreshToken);
  return exists === 1;
};
