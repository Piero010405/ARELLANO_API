import { getMetricas } from "../models/metricasModel.js";

export const obtenerMetricas = async (user) => {
  return await getMetricas(user.name, user.admin);
};