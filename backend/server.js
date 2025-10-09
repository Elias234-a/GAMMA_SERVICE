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
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { initSentry, sentryMiddleware } from './config/sentry.js';
import monitoringConfig from './config/monitoring.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes - Core
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';

// Import routes - Business Core
import vehicleRoutes from './routes/vehicles.js';
import clientRoutes from './routes/clients.js';
import saleRoutes from './routes/sales.js';
import invoiceRoutes from './routes/invoices.js';
import serviceRoutes from './routes/services.js';

// Import routes - Operations
import inventoryRoutes from './routes/inventory.js';
import purchaseRoutes from './routes/purchases.js';
import hrRoutes from './routes/hr.js';
import financingRoutes from './routes/financing.js';
import plateRoutes from './routes/plates.js';

// Import routes - Legacy/External
import orderRoutes from './routes/orders.js';
import technicianRoutes from './routes/technicians.js';
import dianRoutes from './routes/dian.js';
import datacreditoRoutes from './routes/datacredito.js';
import transitoRoutes from './routes/transito.js';

// Import routes - Reports
import reportRoutes from './routes/reports.js';

// Import routes - Health & Monitoring
import healthRoutes from './routes/health.js';

// Import routes - Auth
import authRoutes from './routes/auth.js';

// Import routes - Payments
import paymentsRoutes from './routes/payments.js';

// Inicializar la aplicación Express
const app = express();

// Inicializar Sentry (debe ir antes de todo)
initSentry(app);

// Request handler de Sentry (debe ir antes de rutas)
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);

// Status Monitor Dashboard
app.use(monitoringConfig);

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

// Request logging middleware
app.use(requestLogger);

// Documentación de la API
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'GAMMA Service ERP - API Documentation',
  })
);

// Health check routes (sin auth)
app.use('/api/health', healthRoutes);

// Auth routes (sin auth requerido)
app.use('/api/auth', authRoutes);

// Configuración de rutas - Core
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Business Core Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/services', serviceRoutes); // or /api/workshop

// Operations Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/hr', hrRoutes); // or /api/employees
app.use('/api/financing', financingRoutes);
app.use('/api/plates', plateRoutes);

// Reports Routes
app.use('/api/reports', reportRoutes);

// Payments Routes
app.use('/api/payments', paymentsRoutes);

// Legacy/External Routes
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
    message: 'Bienvenido a GAMMA Service ERP API',
    documentation: '/api-docs',
    version: '1.0.0',
    endpoints: {
      core: ['/users', '/notifications'],
      business: ['/vehicles', '/clients', '/sales', '/invoices', '/services'],
      operations: ['/inventory', '/purchases', '/hr', '/financing', '/plates'],
      reports: ['/reports'],
      external: ['/dian', '/datacredito', '/transito']
    }
  });
});

// Ruta 404
app.all('*', (req, res, next) => {
  const err = new Error(`No se pudo encontrar ${req.originalUrl} en este servidor`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Error logging middleware
app.use(errorLogger);

// Sentry error handler (debe ir antes de errorHandler)
app.use(sentryMiddleware.errorHandler);

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
  logger.info(`📊 Status Monitor disponible en http://localhost:${PORT}/status`);
  logger.info(`🏥 Health Check disponible en http://localhost:${PORT}/api/health`);
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
