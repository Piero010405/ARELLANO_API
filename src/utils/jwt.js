// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// * ACCESS TOKEN
//Genera un access token con duración corta (15m por defecto)
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Verifica el access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_ACCESS);
  } catch (err) {
    return null; // Retorna null en lugar de lanzar excepción
  }
};

// * REFRESH TOKEN
// Genera un refresh token con duración más larga (7d por defecto)
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
};

// Verifica el refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_REFRESH);
  } catch (err) {
    return null; // Retorna null en lugar de lanzar excepción
  }
};
