import sql from 'mssql';
import { getConnection, withRetry } from '../database/connection.js';

export const getMetricas = async (supervisorId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT
        SUM(CASE WHEN OOEE_A_REPORTAR = 'NOTAUDITED' THEN 1 ELSE 0 END) AS notaudited,
        SUM(CASE WHEN OOEE_A_REPORTAR = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN DT_A_REPORTAR = 'FUERA DE DT' THEN 1 ELSE 0 END) AS fueraDT,
        SUM(CASE WHEN OOEE_A_REPORTAR = 'FULLAUDIT' THEN 1 ELSE 0 END) AS fullAudit,
        SUM(CASE 
              WHEN RAZON_OOEE = 'SIN RAZÓN REGISTRADA POR AS' 
                OR RAZON_DT = 'SIN RAZÓN REGISTRADA POR AS' 
              THEN 1 ELSE 0 
            END) AS tiendasFaltantes
      FROM dbo.INDICADORES_DEP ID
      WHERE ID.period = (
        SELECT E2E_ID 
        FROM dbo.NIELSSEN_CURRENT_PERIOD 
        WHERE IS_CURRENT = 1
      )
    `;

    if (!isAdmin) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM dbo.USUARIO_AS_ASIGNACION UA
          WHERE UA.SUPERVISOR_ID = @supervisorId
            AND UA.ACTIVO = 1
            AND LTRIM(RTRIM(UA.AS_NOMBRE)) = LTRIM(RTRIM(ID.[AS]))
        )
      `;
    }

    const request = pool.request();

    if (!isAdmin) {
      request.input("supervisorId", sql.Int, supervisorId);
    }

    const result = await request.query(query);
    return result.recordset[0];
  });
};