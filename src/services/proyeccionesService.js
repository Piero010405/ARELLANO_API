import { insertProyeccion } from '../models/proyeccionesModel.js';

export const createProyeccion = async (proyeccionData) => {
    const { PERIOD, AS, STATUS_PROYECTADO, RAZON, DETALLE_RAZON } = proyeccionData;

    if (!PERIOD || !AS || !STATUS_PROYECTADO || !RAZON || typeof DETALLE_RAZON !== 'string') {
        throw new Error('Campos obligatorios faltantes o incorrectos.');
    }

    return await insertProyeccion(proyeccionData);
};
