import sql from "mssql";
import { getConnection, withRetry } from "../database/connection.js";

const BASE_STORE_SELECT = `
  SELECT
    CAST(CPA.CURRENT_E2E_PERIOD_ID AS NVARCHAR(50)) AS PERIOD,
    HIT.SMS_ID AS CODIGO,

    CASE 
      WHEN ISNULL(HIT.IS_AMP_STORE, 0) = 1 THEN 'Si'
      ELSE 'No'
    END AS AMP,

    HIT.AS_NAME AS [AS],
    HIT.AUDITOR_NAME AS NOMBRE_AUDITOR,
    HIT.CLUSTER_NAME AS CLUSTER,
    STG.DEPARTMENT_NAME AS DEPARTAMENTO,
    HIT.PROVINCE_NAME AS PROVINCIA,
    HIT.DISTRICT_NAME AS DISTRITO,
    HIT.STORE_TYPE AS CANAL,
    HIT.LOCATION AS UBICACION,

    HIT.STATUS_E2E AS STATUS_ACTUAL_EFECTIVO_E2E,
    HIT.STATUS_PROJECTED AS STATUS_PROYECTADO,
    HIT.STATUS_REPORT AS OOEE_A_REPORTAR,

    CASE
      WHEN UPPER(LTRIM(RTRIM(HIT.REASON_TYPE))) = 'OOEE'
      THEN HIT.REASON
      ELSE NULL
    END AS RAZON_OOEE,

    CASE
      WHEN UPPER(LTRIM(RTRIM(HIT.REASON_TYPE))) = 'OOEE'
      THEN HIT.COMMENT
      ELSE NULL
    END AS COMENTARIO_OOEE,

    HIT.PREV_VISIT_DATE AS FECHA_DE_VISITA_PERIODO_ANTERIOR_E2E,
    HIT.ADJUSTED_VISIT_DATE AS FECHA_DE_VISITA_AJUSTADA_CALC,
    HIT.EFFECTIVE_DAYS AS DIAS_TRANSCURRIDOS_EFECTIVOS,

    HIT.DT_PROJECTED AS DT_PROYECTADO,
    HIT.DT_REPORT AS DT_A_REPORTAR,

    CASE
      WHEN UPPER(LTRIM(RTRIM(HIT.REASON_TYPE))) = 'DT'
      THEN HIT.REASON
      ELSE NULL
    END AS RAZON_DT,

    CASE
      WHEN UPPER(LTRIM(RTRIM(HIT.REASON_TYPE))) = 'DT'
      THEN HIT.COMMENT
      ELSE NULL
    END AS COMENTARIO_DT,

    COALESCE(DS.STORE_NAME, STG.STORE_NAME) AS NOMBRE_TIENDA,
    DS.CONTRACT_MONTH_NAME AS MES_CONTRATO
  FROM dbo.HISTORICO_INDICADORES_TIENDA HIT
  CROSS JOIN dbo.vw_Contexto_Periodo_Actual CPA
  LEFT JOIN dbo.DIM_STORE DS
    ON DS.SMS_ID = HIT.SMS_ID
  LEFT JOIN dbo.STG_MUESTRA_PERIODO_ACTUAL STG
    ON STG.PERIOD_ID = HIT.PERIOD_ID
   AND STG.SMS_ID = HIT.SMS_ID
  WHERE HIT.PERIOD_ID = CPA.CURRENT_PERIOD_ID
`;

const USER_SCOPE_FILTER = `
  AND EXISTS (
    SELECT 1
    FROM dbo.APP_AS_PROVINCE_ASIGNACION APA
    WHERE APA.ACTIVO = 1
      AND APA.PROVINCE_ID = HIT.PROVINCE_ID
      AND (
        -- Caso 1: el usuario tiene AS_ID asignados manualmente
        EXISTS (
          SELECT 1
          FROM dbo.APP_USUARIO_AS_ASIGNACION UAA
          WHERE UAA.USUARIO_ID = @userId
            AND UAA.ACTIVO = 1
            AND UAA.AS_ID = APA.AS_ID
        )

        -- Caso 2: fallback inclusivo si el usuario también es AS_ID
        OR APA.AS_ID = @userId
      )
  )
`;

const bindUserScope = (request, userId, isAdmin) => {
  if (!isAdmin) {
    request.input("userId", sql.Int, userId);
  }

  return request;
};

export const getStores = async (userId, isAdmin, offset, pageSize) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = BASE_STORE_SELECT;

    if (!isAdmin) {
      query += USER_SCOPE_FILTER;
    }

    query += `
      ORDER BY HIT.SMS_ID
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    const request = pool
      .request()
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize);

    bindUserScope(request, userId, isAdmin);

    const result = await request.query(query);
    return result.recordset;
  });
};

export const getTotalStores = async (userId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT COUNT(*) AS total
      FROM dbo.HISTORICO_INDICADORES_TIENDA HIT
      CROSS JOIN dbo.vw_Contexto_Periodo_Actual CPA
      WHERE HIT.PERIOD_ID = CPA.CURRENT_PERIOD_ID
    `;

    if (!isAdmin) {
      query += USER_SCOPE_FILTER;
    }

    const request = pool.request();

    bindUserScope(request, userId, isAdmin);

    const result = await request.query(query);
    return result.recordset[0]?.total || 0;
  });
};

export const getStoreById = async (storeId, userId, isAdmin) => {
  return withRetry(async () => {
    const parsedStoreId = Number(storeId);

    if (!Number.isSafeInteger(parsedStoreId)) {
      return null;
    }

    const pool = await getConnection();

    let query = `
      ${BASE_STORE_SELECT}
      AND HIT.SMS_ID = @storeId
    `;

    if (!isAdmin) {
      query += USER_SCOPE_FILTER;
    }

    const request = pool
      .request()
      .input("storeId", sql.BigInt, parsedStoreId);

    bindUserScope(request, userId, isAdmin);

    const result = await request.query(query);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
};

export const getTotalStoresFaltantes = async (userId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      ${BASE_STORE_SELECT}
      AND UPPER(LTRIM(RTRIM(HIT.REASON))) = 'SIN RAZÓN REGISTRADA POR AS'
    `;

    if (!isAdmin) {
      query += USER_SCOPE_FILTER;
    }

    query += `
      ORDER BY HIT.SMS_ID
    `;

    const request = pool.request();

    bindUserScope(request, userId, isAdmin);

    const result = await request.query(query);
    return result.recordset;
  });
};

export const getTotalStoresProyectadas = async (userId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      ${BASE_STORE_SELECT}
      AND (
        (
          UPPER(LTRIM(RTRIM(HIT.STATUS_E2E))) = 'UNKNOWN'
          AND UPPER(LTRIM(RTRIM(HIT.STATUS_PROJECTED))) IN ('NOTAUDITED', 'CANCELLED')
        )
        OR
        (
          UPPER(LTRIM(RTRIM(HIT.DT_PROJECTED))) = 'FUERA DE DT'
          AND NOT (
            HIT.EFFECTIVE_DAYS < HIT.PERIOD_DAYS_ACTUAL - 3
            AND UPPER(LTRIM(RTRIM(HIT.STATUS_REPORT))) IN ('FULLAUDIT', 'PARTIAL')
          )
          AND NOT (
            HIT.EFFECTIVE_DAYS > HIT.PERIOD_DAYS_ACTUAL + 3
            AND UPPER(LTRIM(RTRIM(HIT.STATUS_REPORT))) IN ('UNKNOWN', 'FULLAUDIT', 'PARTIAL')
          )
        )
      )
    `;

    if (!isAdmin) {
      query += USER_SCOPE_FILTER;
    }

    query += `
      ORDER BY HIT.SMS_ID
    `;

    const request = pool.request();

    bindUserScope(request, userId, isAdmin);

    const result = await request.query(query);
    return result.recordset;
  });
};