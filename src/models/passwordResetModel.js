// src/models/passwordResetModel.js
import sql from "mssql";
import { getConnection, withRetry } from '../database/connection.js';

export async function createResetToken(userId, token, expiresAt) {
  // * Hacemos merge para que siempre compare con el token mas reciente
  return withRetry(async () => {
    const pool = await getConnection();
    await pool.request()
      .input("USER_ID", sql.Int, userId)
      .input("TOKEN", sql.NVarChar(10), token)
      .input("EXPIRES_AT", sql.DateTime, expiresAt)
      .query(`
        MERGE PASSWORD_RESET_TOKENS AS target
        USING (SELECT @USER_ID AS USER_ID, @TOKEN AS TOKEN, @EXPIRES_AT AS EXPIRES_AT) AS source
        ON (target.USER_ID = source.USER_ID)
        WHEN MATCHED THEN
          UPDATE SET TOKEN = source.TOKEN, EXPIRES_AT = source.EXPIRES_AT, CREATED_AT = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (USER_ID, TOKEN, EXPIRES_AT)
          VALUES (source.USER_ID, source.TOKEN, source.EXPIRES_AT);
      `);
  });
}

export async function createRequestLog(userId, endpoint) {
  return withRetry(async () => {
    const pool = await getConnection();
    await pool.request()
      .input("USER_ID", sql.Int, userId)
      .input("ENDPOINT", sql.NVarChar(100), endpoint)
      .query(`
        INSERT INTO REQUEST_LOGS (USER_ID, ENDPOINT)
        VALUES (@USER_ID, @ENDPOINT);
      `);
  });
}

export async function validateRequestLog(userId, endpoint) {
  return withRetry(async () => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("USER_ID", sql.Int, userId)
      .input("ENDPOINT", sql.NVarChar(100), endpoint)
      .query(`
        SELECT COUNT(*) AS RequestCount
        FROM REQUEST_LOGS
        WHERE USER_ID = @USER_ID
        AND ENDPOINT = @ENDPOINT
        AND REQUEST_TIMESTAMP >= DATEADD(day, -1, GETDATE());
      `);
    
    return result.recordset[0].RequestCount; 
  });
}

export async function findUserByEmail(email) {
  return withRetry(async () => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("EMAIL", sql.NVarChar(255), email)
      .query("SELECT SUPERVISOR_ID, NOMBRE FROM [dbo].[AS] WHERE EMAIL = @EMAIL");
    return result.recordset[0];
  });
}

export async function findToken(token) {
  return withRetry(async () => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("TOKEN", sql.NVarChar(10), token)
      .query("SELECT * FROM PASSWORD_RESET_TOKENS WHERE TOKEN = @TOKEN");
    return result.recordset[0];
  });
}

export async function deleteToken(token) {
  return withRetry(async () => {
    const pool = await getConnection();
    await pool.request()
      .input("TOKEN", sql.NVarChar(10), token)
      .query("DELETE FROM PASSWORD_RESET_TOKENS WHERE TOKEN = @TOKEN");
  });
}

export async function updatePassword(password, supervisorId) {
  return withRetry(async () => {
    const pool = await getConnection();
    await pool.request()
      .input("SUPERVISOR_ID", sql.Int, supervisorId)
      .input("PASSWORD", sql.NVarChar(255), password)
      .query("UPDATE [dbo].[AS] SET PASSWORD = @PASSWORD WHERE SUPERVISOR_ID = @SUPERVISOR_ID");
  });
}
