// src/controllers/authController.js
import { login } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import { isRefreshTokenValid, invalidateRefreshToken, generateAccessToken, blackListedAccessToken } from '../tokens/tokenManager.js';
import dotenv from 'dotenv';
dotenv.config();

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Missing refresh token' });

    // ✅ Verifica si el refreshToken aún es válido en Redis
    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    // ✅ Decodifica el token sin validar la firma (seguro porque ya verificamos en Redis)
    const decoded = jwt.decode(refreshToken);
    if (!decoded) return res.status(403).json({ success: false, message: 'Malformed token' });

    // ✅ Genera un nuevo accessToken seguro
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, name: decoded.name, admin: decoded.admin });

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
    const { accessToken: accessTokenPromise, refreshToken: refreshTokenPromise, user } = await login(email, password);

    const refreshToken = await refreshTokenPromise;
    const accessToken = await accessTokenPromise;

    // Guardar el refreshToken en una cookie httpOnly (NO accesible desde JavaScript)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'Strict', // Evita ataques CSRF
      path: '/', // Disponible en toda la API
    });

    return res.json({ success: true, accessToken, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export const logoutController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Missing Refresh token' });
  }
  
  if (!accessToken) {
    return res.status(400).json({ success: false, message: 'Missing Access token' });
  }

  try {
    // Intentar invalidar el refreshToken (si ya no existe, no da error)
    const wasInvalidated = await invalidateRefreshToken(refreshToken); // Invalidar refreshToken

    // Invalidar el accessToken (si existe en la blacklist)
    await blackListedAccessToken(accessToken); // Expirar accessToken

    // Borrar la cookie solo si se eliminó correctamente
    if (wasInvalidated) {
      res.clearCookie('refreshToken', { path: '/' }); // BORRAMOS LA COOKIE
    }

    return res.json({ success: true, message: 'User logged out and tokens invalidated' });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
