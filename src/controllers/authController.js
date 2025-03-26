// src/controllers/authController.js
import { login } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import { isRefreshTokenValid, invalidateRefreshToken, generateAccessToken, blackListedAccessToken, isTokenBlacklisted } from '../tokens/tokenManager.js';

export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Missing refresh token' });

    // ✅ Verifica si el refreshToken aún es válido en Redis
    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    // ✅ Decodifica el token sin validar la firma (seguro porque ya verificamos en Redis)
    const decoded = jwt.decode(refreshToken);
    if (!decoded) return res.status(403).json({ success: false, message: 'Malformed token' });

    // ✅ Genera un nuevo accessToken seguro
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, name: decoded.name });

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error('Error in refreshTokenController:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const { token, user } = await login(email, password);
    return res.json({ success: true, token, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export const logoutController = async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!refreshToken || !accessToken) {
    return res.status(400).json({ success: false, message: 'Missing tokens' });
  }

  await invalidateRefreshToken(refreshToken); // Invalidar refreshToken
  await blackListedAccessToken(accessToken); // Expirar accessToken

  return res.json({ success: true, message: 'User logged out and tokens invalidated' });
};
