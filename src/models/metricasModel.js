import sql from 'mssql';
import { getConnection, withRetry } from '../database/connection.js';

export const getMetricas = async (userName, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT
        SUM(CASE WHEN OOEE_A_REPORTAR = 'NOTAUDITED' THEN 1 ELSE 0 END) AS notaudited,
        SUM(CASE WHEN OOEE_A_REPORTAR = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN DT_A_REPORTAR = 'FUERA DE DT' THEN 1 ELSE 0 END) AS fueraDT,
        SUM(CASE WHEN OOEE_A_REPORTAR = 'FULLAUDIT' THEN 1 ELSE 0 END) AS fullAudit,
        SUM(CASE WHEN RAZON_OOEE = 'SIN RAZÓN REGISTRADA POR AS' OR RAZON_DT = 'SIN RAZÓN REGISTRADA POR AS' THEN 1 ELSE 0 END) AS tiendasFaltantes
      FROM dbo.INDICADORES_DEP
      WHERE period = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
    `;

    if (!isAdmin) {
      query += ` AND [AS] = @userName`;
    }

    const request = pool.request();
    if (!isAdmin) request.input("userName", sql.VarChar, userName);

    const result = await request.query(query);
    return result.recordset[0];
  });
};
