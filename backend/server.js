import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler.js';
import { specs } from './config/swagger.js';
import logger from './config/logger.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import technicianRoutes from './routes/technicians.js';
import dianRoutes from './routes/dian.js';
import datacreditoRoutes from './routes/datacredito.js';
import transitoRoutes from './routes/transito.js';
import notificationRoutes from './routes/notifications.js';

// Inicializar la aplicación Express
const app = express();

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com', 'https://www.tudominio.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Logger de solicitudes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Configuración de rutas
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Documentación de la API
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Documentación de la API',
  })
);
app.use('/api/orders', orderRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/dian', dianRoutes);
app.use('/api/datacredito', datacreditoRoutes);
app.use('/api/transito', transitoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});

// Ruta de bienvenida
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenido a la API de Gestión de Técnicos y Órdenes',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Ruta 404
app.all('*', (req, res, next) => {
  const err = new Error(`No se pudo encontrar ${req.originalUrl} en este servidor`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Manejo de errores global
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Importar la configuración de la base de datos
import connectDB from './config/db.js';

// Conectar a la base de datos
connectDB();

// Iniciar el servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📚 Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error(`❌ Error no manejado: ${err.message}`);
  // Cerrar el servidor y salir del proceso
  server.close(() => {
    process.exit(1);
  });
});

// Export the Express app for testing purposes
export default app;
