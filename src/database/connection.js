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
export const withRetry = async (operation, retries = 3, delay = 2000) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;

      console.error(`[DB ERROR] Intento ${attempt} fallido`, {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        number: err?.number,
        state: err?.state,
        class: err?.class,
        serverName: err?.serverName,
        procName: err?.procName,
        lineNumber: err?.lineNumber,
      });

      if (attempt < retries) {
        console.error(`Intento ${attempt} fallido. Reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("[DB ERROR FINAL]", lastError);

  throw new Error("Error persistente en la operación con la base de datos.");
};