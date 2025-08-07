// src/middlewares/auth.js
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { isTokenBlacklisted } from '../tokens/tokenManager.js';
import { validateUserSession } from '../services/sessionService.js';

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

export const authenticateAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access token missing" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(accessToken);
    
    const isValidSession = await validateUserSession(decoded.id, decoded.sessionId);
    if (!isValidSession) {
      return res.status(403).json({ success: false, message: 'Session is no longer valid' });
    }

    req.user = decoded; // Guarda los datos del usuario en la request
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired access token" });
  }
};

export const authenticateLogout = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(400).json({ success: false, message: 'Missing access token' });
  }

  const decodedAccess = verifyAccessToken(accessToken);

  if (!decodedAccess) {
    return res.status(403).json({ success: false, message: 'Invalid or expired tokens' });
  }

  // const refreshToken = req.cookies.refreshToken; // Se obtiene automáticamente
  // if (!refreshToken) {
  //   return res.status(400).json({ success: false, message: 'Missing refresh token' });
  // }

  // const decodedRefresh = verifyRefreshToken(refreshToken);
  // if (!decodedAccess || !decodedRefresh) {
  //   return res.status(403).json({ success: false, message: 'Invalid or expired tokens' });
  // }
  // if (decodedAccess.userId !== decodedRefresh.userId) {
  //   return res.status(403).json({ success: false, message: 'Tokens do not match' });
  // }

  // req.refreshToken = refreshToken;
  req.user = decodedAccess;
  
  next();
};