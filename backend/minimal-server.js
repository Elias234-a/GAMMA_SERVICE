import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger from './config/logger.js';
import connectDB from './config/db.js';

const app = express();
const PORT = 5000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
connectDB();

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

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor HTTP corriendo en http://localhost:${PORT}`);
});

export default app;
