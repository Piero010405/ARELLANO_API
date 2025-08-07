// src/middlewares/auth.js
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from '../tokens/tokenManager.js';
import { validateUserSession } from '../services/sessionService.js';

/**
 * Middleware general para proteger rutas seguras.
 * Valida token + blacklist + sesión activa en SQL Server.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access token missing" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    // 1. Validar token y asegurarse que no esté en la blacklist
    if (await isTokenBlacklisted(accessToken)) {
      return res.status(403).json({ success: false, message: 'Access token has been revoked' });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return res.status(403).json({ success: false, message: "Invalid or expired access token" });
    }

    // 2. Validar sesión activa en base de datos
    const isValidSession = await validateUserSession(decoded.id, decoded.sessionId);
    if (!isValidSession) {
      return res.status(403).json({ success: false, message: 'Session is no longer valid' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Middleware para verificar refresh tokens cuando se necesite renovar access tokens
export const authenticateRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

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