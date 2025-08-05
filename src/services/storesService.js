import { getStores, getStoreById, getTotalStores, getTotalStoresFaltantes, getTotalStoresProyectadas } from "../models/storesModel.js";

export const obtenerStores = async (user, offset, pageSize) => {
    return {
        stores: await getStores(user.name, user.admin,  offset || 0, pageSize || 10),
        total: await getTotalStores(user.name, user.admin),
    }
};

export const obtenerStoreById = async (storeId, user) => {
    return await getStoreById(storeId, user.name, user.admin);
};

export const obtenerStoresFaltantes = async (user) => {
    return await getTotalStoresFaltantes(user.name, user.admin);
};

export const obtenerStoresProyectadas = async (user) => {
    return await getTotalStoresProyectadas(user.name, user.admin);
};