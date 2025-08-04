// src/database/db.js
import sql from 'mssql';
import dbSettings from '../config/dbClient.js';

let pool;

export async function getConnection() {
  try {
    if (!pool || !pool.connected) {
      pool = await sql.connect(dbSettings);
      console.log("✅ SQL Server connected.");
    }
    return pool;
  } catch (err) {
    console.error('DB Connection Error:', err);
    throw new sql.ConnectionError('Fallo al conectar a la base de datos');
  }
}

// Reintento automático (opcional exportable)
export async function withRetry(fn, retries = 3, delay = 2000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      console.warn(`Intento ${attempt} fallido. Reintentando en ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Error persistente en la operación con la base de datos.');
}
