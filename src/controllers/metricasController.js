import { obtenerMetricas } from "../services/metricasService.js";

export const metricasController = async (req, res) => {
  try {
    const metricas = await obtenerMetricas(req.user);
    
    const { notaudited, cancelled, fueraDT, fullAudit, tiendasFaltantes } = metricas;
    const totalTiendas = notaudited + cancelled + fueraDT;

    return res.json({
      notaudited,
      cancelled,
      fueraDT,
      fullAudit,
      tiendasFaltantes,
      totalTiendas,
    });
  } catch (err) {
    console.error("Error al obtener métricas:", err);
    return res.status(500).json({ error: "Error al obtener métricas" });
  }
};