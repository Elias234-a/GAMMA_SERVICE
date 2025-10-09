import redis from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Cache Middleware
 * Cachea respuestas de API para mejorar rendimiento
 */

/**
 * Middleware para cachear respuestas GET
 * @param {number} ttl - Time to live en segundos (default: 300 = 5 minutos)
 * @param {function} keyGenerator - Función opcional para generar clave de cache
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Solo cachear requests GET
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar si Redis está disponible
    if (!redis.isAvailable()) {
      return next();
    }

    try {
      // Generar clave de cache
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : generateCacheKey(req);

      // Intentar obtener del cache
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // Cache HIT - devolver datos cacheados
        logger.debug(`Cache HIT: ${cacheKey}`);
        
        return res.json({
          ...cachedData,
          _cached: true,
          _cacheKey: cacheKey,
        });
      }

      // Cache MISS - continuar al handler
      logger.debug(`Cache MISS: ${cacheKey}`);

      // Interceptar res.json para cachear la respuesta
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Cachear solo respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, data, ttl)
            .then(() => {
              logger.debug(`Cached response: ${cacheKey} (TTL: ${ttl}s)`);
            })
            .catch((error) => {
              logger.error(`Error caching response: ${error.message}`);
            });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Generar clave de cache basada en la request
 */
const generateCacheKey = (req) => {
  const userId = req.user?.id || 'guest';
  const path = req.path;
  const query = JSON.stringify(req.query);
  
  return `api:${userId}:${path}:${query}`;
};

/**
 * Middleware para invalidar cache de un patrón específico
 * Usado en POST, PUT, DELETE para limpiar cache relacionado
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Ejecutar después de la respuesta
    res.on('finish', async () => {
      // Solo invalidar si la operación fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const cachePattern = typeof pattern === 'function' 
            ? pattern(req)
            : pattern;
          
          const deletedCount = await redis.delPattern(cachePattern);
          
          if (deletedCount > 0) {
            logger.debug(`Invalidated ${deletedCount} cache entries matching: ${cachePattern}`);
          }
        } catch (error) {
          logger.error('Error invalidating cache:', error);
        }
      }
    });

    next();
  };
};

/**
 * Middleware para limpiar todo el cache de un recurso
 * Ejemplo: /api/clients/* limpia todo el cache de clientes
 */
const clearResourceCache = (resource) => {
  return invalidateCache((req) => {
    return `api:*:/${resource}/*`;
  });
};

/**
 * Middleware para limpiar cache específico de usuario
 */
const clearUserCache = () => {
  return invalidateCache((req) => {
    const userId = req.user?.id || 'guest';
    return `api:${userId}:*`;
  });
};

/**
 * Generar clave de cache personalizada
 * Útil para cachear queries específicas
 */
const customCacheKey = (prefix, ...parts) => {
  return `custom:${prefix}:${parts.join(':')}`;
};

/**
 * Helper para cachear manualmente
 */
const cacheResponse = async (key, data, ttl = 300) => {
  try {
    await redis.set(key, data, ttl);
    logger.debug(`Manual cache: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error(`Error in manual cache: ${error.message}`);
    return false;
  }
};

/**
 * Helper para obtener del cache manualmente
 */
const getCachedResponse = async (key) => {
  try {
    return await redis.get(key);
  } catch (error) {
    logger.error(`Error getting cached response: ${error.message}`);
    return null;
  }
};

/**
 * Stats del cache para endpoint de admin
 */
const getCacheStats = async () => {
  try {
    const stats = await redis.getStats();
    return {
      enabled: redis.isAvailable(),
      ...stats,
    };
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return {
      enabled: false,
      error: error.message,
    };
  }
};

export {
  cacheMiddleware,
  invalidateCache,
  clearResourceCache,
  clearUserCache,
  customCacheKey,
  cacheResponse,
  getCachedResponse,
  getCacheStats,
};
