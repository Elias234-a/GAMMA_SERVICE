import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import logger from '../config/logger.js';

const router = express.Router();

// Tiempo de inicio del servidor
const startTime = Date.now();

/**
 * GET /api/health
 * Health check completo del sistema
 */
router.get('/', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {},
    system: {}
  };

  try {
    // Check MongoDB
    healthcheck.services.mongodb = await checkMongoDB();
    
    // Check System Resources
    healthcheck.system = getSystemMetrics();
    
    // Determinar estado general
    const allServicesHealthy = Object.values(healthcheck.services)
      .every(service => service.status === 'connected' || service.status === 'healthy');
    
    healthcheck.status = allServicesHealthy ? 'OK' : 'DEGRADED';
    
    const statusCode = healthcheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthcheck);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    healthcheck.status = 'ERROR';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

/**
 * GET /api/health/live
 * Liveness probe - verifica si el servicio está vivo
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now()
  });
});

/**
 * GET /api/health/ready
 * Readiness probe - verifica si el servicio está listo para recibir tráfico
 */
router.get('/ready', async (req, res) => {
  try {
    // Verificar MongoDB
    const isMongoReady = mongoose.connection.readyState === 1;
    
    if (isMongoReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: Date.now()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'MongoDB not connected',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

/**
 * GET /api/health/metrics
 * Métricas detalladas del sistema
 */
router.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: Date.now(),
    uptime: {
      process: process.uptime(),
      system: os.uptime(),
      application: (Date.now() - startTime) / 1000
    },
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      process: process.memoryUsage()
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      loadAverage: os.loadavg()
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version
    },
    mongodb: {
      state: getMongoConnectionState(),
      readyState: mongoose.connection.readyState
    }
  };
  
  res.json(metrics);
});

// Helper functions

/**
 * Verifica el estado de MongoDB
 */
async function checkMongoDB() {
  try {
    const state = mongoose.connection.readyState;
    
    if (state === 1) {
      // Ping a la base de datos
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        readyState: state,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        responseTime: 'OK'
      };
    } else {
      return {
        status: 'disconnected',
        readyState: state,
        message: getMongoConnectionState()
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Obtiene métricas del sistema
 */
function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(usedMem),
      usagePercent: ((usedMem / totalMem) * 100).toFixed(2) + '%'
    },
    loadAverage: os.loadavg().map(load => load.toFixed(2)),
    uptime: formatUptime(os.uptime())
  };
}

/**
 * Convierte el readyState de Mongoose a texto legible
 */
function getMongoConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

/**
 * Formatea bytes a formato legible
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

/**
 * Formatea uptime a formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export default router;
