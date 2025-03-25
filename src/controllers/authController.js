// src/controllers/authController.js
import { login } from '../services/authService.js';
import { isRefreshTokenValid, invalidateRefreshToken, generateAccessToken } from '../tokens/tokenManager.js';

export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Missing refresh token' });

  const valid = await isRefreshTokenValid(refreshToken);
  if (!valid) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

  const decoded = jwt.decode(refreshToken);
  const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, name: decoded.name });

  return res.json({ success: true, accessToken: newAccessToken });
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
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Missing refresh token' });

  await invalidateRefreshToken(refreshToken);
  return res.json({ success: true, message: 'User logged out and token invalidated' });
};