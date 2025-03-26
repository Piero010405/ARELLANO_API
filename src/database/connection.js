// src/database/db.js
import sql from 'mssql';
import dbSettings from '../config/dbClient.js';

let pool;

export async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(dbSettings);
    }
    return pool;
  } catch (err) {
    console.error('DB Connection Error:', err);
    throw err;
  }
}
