import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorHandler.js';

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

// Inicializar la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de rutas
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/dian', dianRoutes);
app.use('/api/datacredito', datacreditoRoutes);
app.use('/api/transito', transitoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});

// Manejo de errores
app.use(errorHandler);

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamma_service';
const PORT = process.env.PORT || 5000;

// Configuración de mongoose
mongoose.set('strictQuery', true);

// Conexión a MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
  .then(() => {
    console.log('Conectado a MongoDB');
    // Iniciar el servidor después de conectar a la base de datos
    app.listen(PORT, () => {
      console.log(`Servidor en ejecución en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
  process.exit(1);
});

// Export the Express app for testing purposes
export default app;
