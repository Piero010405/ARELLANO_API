// src/controllers/lastUpdateController.js
import { obtenerLastUpdate } from "../services/lastUpdateService.js";
import { lasUpdateArchives } from "../utils/constants.js";

export const lastUpdateE2eController = async (req, res) => {
  try {
    const filename = lasUpdateArchives.E2E;
    const lastUpdate = await obtenerLastUpdate(filename);
    
    const { fecha_actual, fecha, hora, minutos, ARCHIVO } = lastUpdate;
    
    return res.json({
      ARCHIVO,
      fecha_actual,
      fecha,
      hora,
      minutos
    });
  } catch (err) {
    console.error("Error al obtener la última fecha de actualización:", err);
    return res.status(500).json({ error: "Error al obtener última fecha de actualización" });
  }
};