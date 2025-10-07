// src/services/lastUpdateService.js
import { getLastUpdate } from "../models/lastUpdateModel.js";

export const obtenerLastUpdate = async (filename) => {
  return await getLastUpdate(filename);
};