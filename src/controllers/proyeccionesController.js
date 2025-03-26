import { createProyeccion } from '../services/proyeccionesService.js';

export const postProyeccion = async (req, res) => {
    try {
        const result = await createProyeccion(req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
