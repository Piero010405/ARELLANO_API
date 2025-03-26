import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const getStores = async (userName, isAdmin, offset, pageSize) => {
  const pool = await getConnection();

  const query = isAdmin
  ? 
   `SELECT ID.*, MUE.NOMBRE AS NOMBRE_TIENDA, MUE.[MES CONTRATO] AS MES_CONTRATO
    FROM INDICADORES_DEP ID
    LEFT JOIN dbo.MUESTRA MUE ON MUE.CODIGO = ID.CODIGO
    WHERE ID.PERIOD = (SELECT E2E_ID FROM NIELSSEN_CURRENT_PERIOD WHERE IS_CURRENT = 1)
    ORDER BY ID.CODIGO
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
  : 
   `SELECT ID.*, MUE.NOMBRE AS NOMBRE_TIENDA, MUE.[MES CONTRATO] AS MES_CONTRATO
    FROM INDICADORES_DEP ID
    LEFT JOIN dbo.MUESTRA MUE ON MUE.CODIGO = ID.CODIGO
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
    LEFT JOIN dbo.MUESTRA MUE ON MUE.CODIGO = ID.CODIGO
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