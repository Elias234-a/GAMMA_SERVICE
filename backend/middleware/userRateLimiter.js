import { RateLimiterMemory, RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';
import logger from '../config/logger.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Rate limiter por usuario usando memoria
 * Para producción, usar RateLimiterMongo o Redis
 */
const userRateLimiterMemory = new RateLimiterMemory({
  points: 100, // Número de requests permitidos
  duration: 60, // Por ventana de tiempo (segundos)
  blockDuration: 60 * 15, // Bloquear por 15 minutos si se excede
});

/**
 * Rate limiter por IP para usuarios no autenticados
 */
const ipRateLimiter = new RateLimiterMemory({
  points: 50,
  duration: 60,
  blockDuration: 60 * 15,
});

/**
 * Rate limiter por usuario usando MongoDB (para producción)
 */
let userRateLimiterMongo = null;

// Inicializar MongoDB rate limiter cuando la conexión esté lista
mongoose.connection.once('open', () => {
  try {
    userRateLimiterMongo = new RateLimiterMongo({
      storeClient: mongoose.connection,
      points: 100,
      duration: 60,
      blockDuration: 60 * 15,
      tableName: 'rateLimits'
    });
    logger.info('MongoDB rate limiter initialized');
  } catch (error) {
    logger.error('Error initializing MongoDB rate limiter:', error);
  }
});

/**
 * Middleware de rate limiting por usuario
 */
export const userRateLimit = (options = {}) => {
  const {
    points = 100,
    duration = 60,
    blockDuration = 900
  } = options;

  return async (req, res, next) => {
    try {
      // Determinar el identificador (userId o IP)
      const identifier = req.user?.id || req.ip;
      const limiter = req.user?.id && userRateLimiterMongo ? 
        userRateLimiterMongo : 
        (req.user?.id ? userRateLimiterMemory : ipRateLimiter);

      // Intentar consumir un punto
      const rateLimiterRes = await limiter.consume(identifier);

      // Agregar headers de rate limit
      res.set({
        'X-RateLimit-Limit': points,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString()
      });

      // Advertir si quedan pocos intentos
      if (rateLimiterRes.remainingPoints <= 10) {
        logger.warn('User approaching rate limit', {
          userId: req.user?.id,
          ip: req.ip,
          remaining: rateLimiterRes.remainingPoints
        });
      }

      next();

    } catch (error) {
      // Si se excede el límite
      if (error instanceof Error && error.name === 'RateLimiterRes') {
        const retryAfter = Math.ceil(error.msBeforeNext / 1000);

        // Log de auditoría
        await AuditLog.log({
          user: req.user?._id,
          userId: req.user?.id,
          action: 'RATE_LIMIT_EXCEEDED',
          details: {
            path: req.path,
            method: req.method
          },
          req,
          severity: 'warning'
        });

        logger.warn('Rate limit exceeded', {
          userId: req.user?.id,
          ip: req.ip,
          path: req.path,
          retryAfter
        });

        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.',
          retryAfter,
          resetAt: new Date(Date.now() + error.msBeforeNext).toISOString()
        });
      }

      // Error desconocido
      logger.error('Rate limiter error:', error);
      next(); // Continuar en caso de error del rate limiter
    }
  };
};

/**
 * Rate limiter estricto para operaciones sensibles
 */
export const strictRateLimit = userRateLimit({
  points: 10,
  duration: 60,
  blockDuration: 1800 // 30 minutos
});

/**
 * Rate limiter para operaciones de escritura
 */
export const writeRateLimit = userRateLimit({
  points: 50,
  duration: 60,
  blockDuration: 600 // 10 minutos
});

/**
 * Rate limiter para operaciones de lectura
 */
export const readRateLimit = userRateLimit({
  points: 200,
  duration: 60,
  blockDuration: 300 // 5 minutos
});

/**
 * Rate limiter para autenticación
 */
export const authRateLimit = async (req, res, next) => {
  const identifier = req.body.email || req.ip;
  const authLimiter = new RateLimiterMemory({
    points: 5, // 5 intentos
    duration: 900, // 15 minutos
    blockDuration: 1800 // Bloquear 30 minutos
  });

  try {
    await authLimiter.consume(identifier);
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'RateLimiterRes') {
      const retryAfter = Math.ceil(error.msBeforeNext / 1000);

      // Log de intentos excesivos de login
      await AuditLog.log({
        userEmail: req.body.email,
        action: 'RATE_LIMIT_EXCEEDED',
        resource: 'Auth',
        details: {
          reason: 'Too many login attempts',
          identifier
        },
        ipAddress: req.ip,
        severity: 'error'
      });

      logger.error('Too many authentication attempts', {
        identifier,
        ip: req.ip
      });

      return res.status(429).json({
        success: false,
        message: 'Demasiados intentos de autenticación. Cuenta bloqueada temporalmente.',
        retryAfter
      });
    }

    next();
  }
};

/**
 * Limpiar rate limits para un usuario (útil después de cambio de contraseña)
 */
export const clearUserRateLimit = async (userId) => {
  try {
    if (userRateLimiterMongo) {
      await userRateLimiterMongo.delete(userId);
    }
    await userRateLimiterMemory.delete(userId);
    logger.info('Rate limit cleared for user', { userId });
  } catch (error) {
    logger.error('Error clearing rate limit:', error);
  }
};

export default {
  userRateLimit,
  strictRateLimit,
  writeRateLimit,
  readRateLimit,
  authRateLimit,
  clearUserRateLimit
};
