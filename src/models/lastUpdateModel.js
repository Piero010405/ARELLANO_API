// src/models/lastUpdateModel.js
import sql from 'mssql';
import { getConnection, withRetry } from '../database/connection.js';

export const getLastUpdate = async (filename) => {
  return withRetry(async () => {
    const pool = await getConnection();

    const result = await pool.request()
    .input('file_name', sql.Int, filename)
    .query(`SELECT * FROM FECHA_ACTUALIZACION WHERE ARCHIVO = @file_name`);

    return result.recordset[0];
  });
};