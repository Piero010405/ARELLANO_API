import sql from 'mssql';
import { getConnection, withRetry } from '../database/connection.js';

export const getMetricas = async (userId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT
        COALESCE(SUM(CASE 
          WHEN UPPER(LTRIM(RTRIM(HIT.STATUS_REPORT))) = 'NOTAUDITED' 
          THEN 1 ELSE 0 
        END), 0) AS notaudited,

        COALESCE(SUM(CASE 
          WHEN UPPER(LTRIM(RTRIM(HIT.STATUS_REPORT))) = 'CANCELLED' 
          THEN 1 ELSE 0 
        END), 0) AS cancelled,

        COALESCE(SUM(CASE 
          WHEN UPPER(LTRIM(RTRIM(HIT.DT_REPORT))) = 'FUERA DE DT' 
          THEN 1 ELSE 0 
        END), 0) AS fueraDT,

        COALESCE(SUM(CASE 
          WHEN UPPER(LTRIM(RTRIM(HIT.STATUS_REPORT))) = 'FULLAUDIT' 
          THEN 1 ELSE 0 
        END), 0) AS fullAudit,

        COALESCE(SUM(CASE 
          WHEN UPPER(LTRIM(RTRIM(HIT.REASON))) = 'SIN RAZÓN REGISTRADA POR AS'
          THEN 1 ELSE 0 
        END), 0) AS tiendasFaltantes
      FROM dbo.HISTORICO_INDICADORES_TIENDA HIT
      WHERE HIT.PERIOD_ID = (
        SELECT CURRENT_PERIOD_ID
        FROM dbo.vw_Contexto_Periodo_Actual
      )
    `;

    if (!isAdmin) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM dbo.APP_AS_PROVINCE_ASIGNACION APA
          WHERE APA.ACTIVO = 1
            AND APA.PROVINCE_ID = HIT.PROVINCE_ID
            AND (
              EXISTS (
                SELECT 1
                FROM dbo.APP_USUARIO_AS_ASIGNACION UAA
                WHERE UAA.USUARIO_ID = @userId
                  AND UAA.ACTIVO = 1
                  AND UAA.AS_ID = APA.AS_ID
              )
              OR APA.AS_ID = @userId
            )
        )
      `;
    }

    const request = pool.request();

    if (!isAdmin) {
      request.input('userId', sql.Int, userId);
    }

    const result = await request.query(query);

    return result.recordset[0] ?? {
      notaudited: 0,
      cancelled: 0,
      fueraDT: 0,
      fullAudit: 0,
      tiendasFaltantes: 0,
    };
  });
};