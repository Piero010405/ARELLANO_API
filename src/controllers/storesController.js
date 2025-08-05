import { obtenerStores, obtenerStoreById, obtenerStoresFaltantes, obtenerStoresProyectadas } from "../services/storesService.js";

export const storesController = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize || "10");
    const offset = parseInt(req.query.offset || "0");
    
    const storesData = await obtenerStores(req.user, offset, pageSize);
    
    res.status(200).json(storesData);
  } catch (err) {
    console.error("Error al obtener las tiendas:", err);
    return res.status(500).json({ error: "Error al obtener tiendas" });
  }
};

export const storesByIdController = async (req, res) => {
  try {
      const { id } = req.params;
      const store = await obtenerStoreById(id, req.user);
      
      res.status(200).json(store);
    } catch (err) {
      console.error("Error al obtener la tienda:", err);
      return res.status(500).json({ error: "Error al obtener la tienda" });
    }
};

export const storesFaltantesController = async (req, res) => {
  try {
    const storesData = await obtenerStoresFaltantes(req.user);
    
    res.status(200).json(storesData);
  } catch (err) {
    console.error("Error al obtener las tiendas faltantes:", err);
    return res.status(500).json({ error: "Error al obtener tiendas faltantes" });
  }
};

export const storesProyectadasController = async (req, res) => {
  try {
    const storesData = await obtenerStoresProyectadas(req.user);
    
    res.status(200).json(storesData);
  } catch (err) {
    console.error("Error al obtener las tiendas proyectadas:", err);
    return res.status(500).json({ error: "Error al obtener tiendas proyectadas" });
  }
};