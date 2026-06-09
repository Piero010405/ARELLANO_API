import sql from "mssql";
import { getConnection, withRetry } from "../database/connection.js";

export const getStores = async (supervisorId, isAdmin, offset, pageSize) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT 
        ID.*, 
        MUE.NOMBRE AS NOMBRE_TIENDA, 
        MUE.[MES CONTRATO] AS MES_CONTRATO
      FROM dbo.INDICADORES_DEP ID
      LEFT JOIN dbo.MUESTRA_HISTORICA MUE 
        ON MUE.CODIGO = ID.CODIGO
      WHERE ID.PERIOD = (
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

    query += `
      ORDER BY ID.CODIGO
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    const request = pool.request()
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize);

    if (!isAdmin) {
      request.input("supervisorId", sql.Int, supervisorId);
    }

    const result = await request.query(query);
    return result.recordset;
  });
};

export const getTotalStores = async (supervisorId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT COUNT(*) AS total 
      FROM dbo.INDICADORES_DEP ID
      WHERE ID.PERIOD = (
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
    return result.recordset[0]?.total || 0;
  });
};

export const getStoreById = async (storeId, supervisorId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT TOP 1 
        ID.*, 
        MUE.NOMBRE AS NOMBRE_TIENDA, 
        MUE.[MES CONTRATO] AS MES_CONTRATO
      FROM dbo.INDICADORES_DEP ID
      LEFT JOIN dbo.MUESTRA_HISTORICA MUE 
        ON MUE.CODIGO = ID.CODIGO
      WHERE ID.CODIGO = @storeId
        AND ID.PERIOD = (
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

    const request = pool.request()
      .input("storeId", sql.VarChar, storeId);

    if (!isAdmin) {
      request.input("supervisorId", sql.Int, supervisorId);
    }

    const result = await request.query(query);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  });
};

export const getTotalStoresFaltantes = async (supervisorId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT 
        ID.PERIOD, 
        ID.CODIGO, 
        ID.AMP, 
        ID.[AS], 
        ID.NOMBRE_AUDITOR, 
        ID.CLUSTER, 
        ID.TERRITORIO, 
        ID.PROVINCIA, 
        ID.DISTRITO, 
        ID.CANAL, 
        ID.UBICACION, 
        ID.STATUS_ACTUAL_EFECTIVO_E2E, 
        ID.STATUS_PROYECTADO, 
        ID.OOEE_A_REPORTAR, 
        ID.RAZON_OOEE, 
        ID.COMENTARIO_OOEE, 
        ID.FECHA_DE_VISITA_PERIODO_ANTERIOR_E2E, 
        ID.FECHA_DE_VISITA_AJUSTADA_CALC, 
        ID.DIAS_TRANSCURRIDOS_EFECTIVOS, 
        ID.DT_PROYECTADO, 
        ID.DT_A_REPORTAR, 
        ID.RAZON_DT, 
        ID.COMENTARIO_DT
      FROM dbo.INDICADORES_DEP ID
      WHERE ID.PERIOD = (
        SELECT E2E_ID 
        FROM dbo.NIELSSEN_CURRENT_PERIOD 
        WHERE IS_CURRENT = 1
      )
      AND (
        ID.RAZON_OOEE = 'SIN RAZÓN REGISTRADA POR AS' 
        OR ID.RAZON_DT = 'SIN RAZÓN REGISTRADA POR AS'
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
    return result.recordset;
  });
};

export const getTotalStoresProyectadas = async (supervisorId, isAdmin) => {
  return withRetry(async () => {
    const pool = await getConnection();

    let query = `
      SELECT 
        ID.PERIOD, 
        ID.CODIGO, 
        ID.AMP, 
        ID.[AS], 
        ID.NOMBRE_AUDITOR, 
        ID.CLUSTER, 
        ID.TERRITORIO, 
        ID.PROVINCIA, 
        ID.DISTRITO, 
        ID.CANAL, 
        ID.UBICACION, 
        ID.STATUS_ACTUAL_EFECTIVO_E2E, 
        ID.STATUS_PROYECTADO, 
        ID.OOEE_A_REPORTAR, 
        ID.RAZON_OOEE, 
        ID.COMENTARIO_OOEE, 
        ID.FECHA_DE_VISITA_PERIODO_ANTERIOR_E2E, 
        ID.FECHA_DE_VISITA_AJUSTADA_CALC, 
        ID.DIAS_TRANSCURRIDOS_EFECTIVOS, 
        ID.DT_PROYECTADO, 
        ID.DT_A_REPORTAR, 
        ID.RAZON_DT, 
        ID.COMENTARIO_DT
      FROM dbo.INDICADORES_DEP ID
      WHERE ID.PERIOD = (
        SELECT E2E_ID 
        FROM dbo.NIELSSEN_CURRENT_PERIOD 
        WHERE IS_CURRENT = 1
      )
      AND (
        (
          ID.STATUS_ACTUAL_EFECTIVO_E2E = 'UNKNOWN' 
          AND ID.STATUS_PROYECTADO IN ('NOTAUDITED', 'CANCELLED')
        ) 
        OR 
        (
          ID.[FUERA_DE_DT?_LIM_INF] = 'REGULAR' 
          AND ID.[FUERA_DE_DT?_LIM_SUP] = 'REGULAR' 
          AND ID.DT_PROYECTADO = 'FUERA DE DT'
        )
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
    return result.recordset;
  });
};