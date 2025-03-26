import { obtenerStores, obtenerStoreById } from "../services/storesService";

export const storesController = async (req, res) => {
  try {
    const storesData = await obtenerStores(req.user);
    
    res.status(200).json(storesData);
  } catch (err) {
    console.error("Error al obtener las tiendas:", err);
    return res.status(500).json({ error: "Error al obtener tiendas" });
  }
};