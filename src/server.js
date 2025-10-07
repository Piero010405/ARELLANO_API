import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import metricasRoutes from "./routes/metricasRoutes.js";
import proyeccionesRoutes from "./routes/proyeccionesRoutes.js";
import storesRoutes from "./routes/storesRoutes.js";
import lastUpdateRoutes from "./routes/lastUpdateRoutes.js";
import { errorHandler } from './middlewares/errorHandler.js';
dotenv.config();

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(errorHandler);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/proyecciones', proyeccionesRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/last-update', lastUpdateRoutes);

// Rechazar rutas desconocidas
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Rechazar rutas desconocidas
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Deshabilitar stacktrace en producción
if (process.env.NODE_ENV === 'production') {
  app.set('x-powered-by', false); // Oculta tecnología usada
}

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running securely on port ${PORT}`));