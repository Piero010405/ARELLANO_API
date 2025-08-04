// src/controllers/authController.js
import { login } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import { isRefreshTokenValid, invalidateUserRefreshTokens, generateAccessToken, blackListedAccessToken } from '../tokens/tokenManager.js';
import dotenv from 'dotenv';
dotenv.config();

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Missing refresh token' });

    // ✅ Verifica si el refreshToken aún es válido en SQL SERVER
    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    // ✅ Decodifica el token sin validar la firma (seguro porque ya verificamos en SQL SERVER (antes REDIS))
    const decoded = jwt.decode(refreshToken);
    if (!decoded) return res.status(403).json({ success: false, message: 'Malformed token' });

    // ✅ Genera un nuevo accessToken seguro
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, name: decoded.name, admin: decoded.admin, photo: decoded.photo });

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error('Error in refreshTokenController:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const validateTokenController = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
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
      secure: process.env.NODE_ENV === 'production' ? true : false, // ← debe ser `false` en dev
      sameSite: 'lax', // ← usa 'none' solo si estás cruzando dominios + HTTPS
      path: '/',
    });

    return res.json({ success: true, accessToken, user });
  } catch (err) {
    console.error('Error in loginController:', err);
    return res.status(401).json({ success: false, message: err.message });
  }
};

export const logoutController = async (req, res) => {
  // const refreshToken = req.cookies.refreshToken;
  const accessToken = req.headers.authorization?.split(' ')[1];
  
  // if (!refreshToken) {
  //   return res.status(400).json({ success: false, message: 'Missing Refresh token' });
  // }
  
  if (!accessToken) {
    return res.status(400).json({ success: false, message: 'Missing Access token' });
  }

  try {
    // Invalida TODOS los refreshTokens de ese usuario
    if (req.user?.id) {
      await invalidateUserRefreshTokens(req.user.id);
    }
    
    // Invalidar el accessToken (si existe en la blacklist)
    // Opcional: blacklist del accessToken actual
    if (accessToken) {
      await blackListedAccessToken(accessToken);
    }

    // // Intentar invalidar el refreshToken (si ya no existe, no da error)
    // const wasInvalidated = await invalidateRefreshToken(refreshToken); // Invalidar refreshToken
    // Borrar la cookie solo si se eliminó correctamente

    // Borrar la cookie, sin importar si existe o no
    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ success: true, message: 'User logged out and tokens invalidated' });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
