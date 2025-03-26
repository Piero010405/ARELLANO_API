// src/middlewares/auth.js
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from '../tokens/tokenManager.js';

//Middleware para proteger rutas con un access token válido
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  if (await isTokenBlacklisted(token)) {
    return res.status(403).json({ success: false, message: 'Token has been revoked' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

//Middleware para verificar refresh tokens cuando se necesite renovar access tokens
export const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Missing refresh token' });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  req.user = decoded; // Guarda el usuario en la request para la generación del nuevo access token
  next();
};