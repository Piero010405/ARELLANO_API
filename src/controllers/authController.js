// src/controllers/authController.js
import { login } from '../services/authService.js';

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

export const logoutController = (req, res) => {
  // Como JWT es stateless, solo invalidamos en frontend (opcional: usar blacklists)
  return res.json({ success: true, message: 'User logged out' });
};
