import sql from 'mssql';
import { getConnection, withRetry } from '../database/connection.js';

export const insertProyeccion = async (proyeccionData) => {
    return withRetry(async () => {
        const {
            PERIOD, SMS_ID, AS, STATUS_PROYECTADO,
            RAZON, COMENTARIO, SE_ANULARA_PROXIMO_PERIODO, DETALLE_RAZON
        } = proyeccionData;

        const pool = await getConnection();
        await pool
            .request()
            .input('PERIOD', sql.VarChar, PERIOD)
            .input('SMS_ID', sql.BigInt, String(SMS_ID))
            .input('AS', sql.VarChar, AS)
            .input('STATUS_PROYECTADO', sql.VarChar, STATUS_PROYECTADO)
            .input('RAZON', sql.VarChar, RAZON)
            .input('COMENTARIO', sql.VarChar, COMENTARIO || null)
            .input('SE_ANULARA_PROXIMO_PERIODO', sql.VarChar, SE_ANULARA_PROXIMO_PERIODO || null)
            .input('DETALLE_RAZON', sql.VarChar, DETALLE_RAZON)
            .query(`
                INSERT INTO PROYECCIONES
                (PERIOD, SMS_ID, [AS], STATUS_PROYECTADO, RAZON, COMENTARIO, SE_ANULARA_PROXIMO_PERIODO, DETALLE_RAZON)
                VALUES (@PERIOD, @SMS_ID, @AS, @STATUS_PROYECTADO, @RAZON, @COMENTARIO, @SE_ANULARA_PROXIMO_PERIODO, @DETALLE_RAZON)
            `);

        return { success: true, message: 'Proyección registrada correctamente.' };
    });
};