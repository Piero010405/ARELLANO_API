import { obtenerMetricas } from "../services/metricasService.js";

export const metricasController = async (req, res) => {
  try {
    const metricas = await obtenerMetricas(req.user);

    const notaudited = Number(metricas?.notaudited ?? 0);
    const cancelled = Number(metricas?.cancelled ?? 0);
    const fueraDT = Number(metricas?.fueraDT ?? 0);
    const fullAudit = Number(metricas?.fullAudit ?? 0);
    const tiendasFaltantes = Number(metricas?.tiendasFaltantes ?? 0);

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