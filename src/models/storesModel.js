import sql from "mssql";
import { getConnection } from "../database/connection.js";

export const getStores = async (userName, isAdmin, offset, pageSize) => {
  const pool = await getConnection();

  const query = isAdmin
  ? 
   `SELECT ID.*, MUE.NOMBRE AS NOMBRE_TIENDA, MUE.[MES CONTRATO] AS MES_CONTRATO
    FROM INDICADORES_DEP ID
    LEFT JOIN dbo.MUESTRA_HISTORICA MUE ON MUE.CODIGO = ID.CODIGO
    WHERE ID.PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
    ORDER BY ID.CODIGO
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
  : 
   `SELECT ID.*, MUE.NOMBRE AS NOMBRE_TIENDA, MUE.[MES CONTRATO] AS MES_CONTRATO
    FROM INDICADORES_DEP ID
    LEFT JOIN dbo.MUESTRA_HISTORICA MUE ON MUE.CODIGO = ID.CODIGO
    WHERE ID.PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
    AND ID.[AS] = @userName
    ORDER BY ID.CODIGO
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;

    const result = await pool.request()
    .input("userName", sql.VarChar, userName)
    .input("offset", sql.Int, offset)
    .input("pageSize", sql.Int, pageSize)
    .query(query);

    return result.recordset;
}

export const getTotalStores = async (userName, isAdmin) => {
    const pool = await getConnection();

    const query = isAdmin
    ? 
    `SELECT COUNT(*) as total FROM INDICADORES_DEP WHERE PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)`
    : 
    `SELECT COUNT(*) as total FROM INDICADORES_DEP WHERE PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1) AND [AS] = @userName`;

    const result = await pool.request()
    .input("userName", sql.VarChar, userName)
    .query(query);

    return result.recordset[0]?.total || 0;
}

export const getStoreById = async (storeId, userName, isAdmin) => {
    const pool = await getConnection();

    let query = `
    SELECT TOP 1 ID.*, MUE.NOMBRE AS NOMBRE_TIENDA, MUE.[MES CONTRATO] AS MES_CONTRATO
    FROM INDICADORES_DEP ID
    LEFT JOIN dbo.MUESTRA_HISTORICA MUE ON MUE.CODIGO = ID.CODIGO
    WHERE ID.CODIGO = @storeId
    AND ID.PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)`;

    if (!isAdmin) {
    query += ` AND ID.[AS] = @userName`;
    }

    const result = await pool.request()
    .input("storeId", sql.VarChar, storeId)
    .input("userName", sql.VarChar, userName)
    .query(query);

    return result.recordset.length > 0 ? result.recordset[0] : null;
}

export const getTotalStoresFaltantes = async (userName, isAdmin) => {
    const pool = await getConnection();

    let query = `
      SELECT 
        PERIOD, CODIGO, AMP, [AS], NOMBRE_AUDITOR, CLUSTER, TERRITORIO, PROVINCIA, DISTRITO, 
        CANAL, UBICACION, STATUS_ACTUAL_EFECTIVO_E2E, STATUS_PROYECTADO, OOEE_A_REPORTAR, 
        RAZON_OOEE, COMENTARIO_OOEE, FECHA_DE_VISITA_PERIODO_ANTERIOR_E2E, 
        FECHA_DE_VISITA_AJUSTADA_CALC, DIAS_TRANSCURRIDOS_EFECTIVOS, 
        DT_PROYECTADO, DT_A_REPORTAR, RAZON_DT, COMENTARIO_DT
      FROM dbo.INDICADORES_DEP 
      WHERE PERIOD = (SELECT E2E_ID FROM dbo.NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
      AND (RAZON_OOEE = 'SIN RAZÓN REGISTRADA POR AS' OR RAZON_DT = 'SIN RAZÓN REGISTRADA POR AS')
    `;

    if (!isAdmin) {
        query += ` AND [AS] = @userName`;
    }

    const result = await pool.request()
    .input("userName", sql.VarChar, userName)
    .query(query);

    return result.recordset;
}

export const getTotalStoresProyectadas = async (userName, isAdmin) => {
    const pool = await getConnection();

    let query = `
      SELECT 
        PERIOD, CODIGO, AMP, [AS], NOMBRE_AUDITOR, CLUSTER, TERRITORIO, PROVINCIA, DISTRITO, 
        CANAL, UBICACION, STATUS_ACTUAL_EFECTIVO_E2E, STATUS_PROYECTADO, OOEE_A_REPORTAR, 
        RAZON_OOEE, COMENTARIO_OOEE, FECHA_DE_VISITA_PERIODO_ANTERIOR_E2E, 
        FECHA_DE_VISITA_AJUSTADA_CALC, DIAS_TRANSCURRIDOS_EFECTIVOS, 
        DT_PROYECTADO, DT_A_REPORTAR, RAZON_DT, COMENTARIO_DT
      FROM dbo.INDICADORES_DEP 
      WHERE PERIOD = (SELECT E2E_ID FROM dbo.NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
      AND ((STATUS_ACTUAL_EFECTIVO_E2E = 'UNKNOWN' AND STATUS_PROYECTADO IN ('NOTAUDITED', 'CANCELLED')) OR ([FUERA_DE_DT?_LIM_INF] = 'REGULAR' AND [FUERA_DE_DT?_LIM_SUP] = 'REGULAR' AND DT_PROYECTADO = 'FUERA DE DT'))
    `;

    if (!isAdmin) {
        query += ` AND [AS] = @userName`;
    }

    const result = await pool.request()
    .input("userName", sql.VarChar, userName)
    .query(query);

    return result.recordset;
}