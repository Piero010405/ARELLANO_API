// src/middlewares/errorHandler.js
import sql from 'mssql';

export function errorHandler(err, req, res, next) {
  console.error('🚨 Error en la API:', err);

  if (err instanceof sql.ConnectionError || err.code === 'ETIMEOUT') {
    return res.status(503).json({ error: 'Base de datos no disponible. Intenta más tarde.' });
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}
