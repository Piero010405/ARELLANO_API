import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import metricasRoutes from "./routes/metricasRoutes.js";
import proyeccionesRoutes from "./routes/proyeccionesRoutes.js";
import storesRoutes from "./routes/storesRoutes.js";
import { connectRedis } from './config/redisClient.js';

dotenv.config();

await connectRedis();

const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({credentials: true}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/proyecciones', proyeccionesRoutes);
app.use('api/stores', storesRoutes);

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running securely on port ${PORT}`));