import sql from 'mssql';
import { getConnection } from '../database/connection.js';

export async function createOrUpdateActiveSession(userId, sessionId) {
  const pool = await getConnection();
  await pool.request()
    .input('user_id', sql.Int, userId)
    .input('session_id', sql.NVarChar(255), sessionId)
    .query(`
      MERGE ACTIVE_SESSIONS AS target
      USING (SELECT @user_id AS user_id, @session_id AS session_id) AS source
      ON (target.USER_ID = source.user_id)
      WHEN MATCHED THEN
        UPDATE SET SESSION_ID = source.session_id, CREATED_AT = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (USER_ID, SESSION_ID)
        VALUES (source.user_id, source.session_id);
    `);
}

export async function getActiveSession(userId) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`SELECT * FROM ACTIVE_SESSIONS WHERE USER_ID = @user_id`);
  return result.recordset[0];
}

export async function deleteActiveSession(userId) {
  const pool = await getConnection();
  await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`DELETE FROM ACTIVE_SESSIONS WHERE USER_ID = @user_id`);
}
