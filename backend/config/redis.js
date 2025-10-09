import Redis from 'ioredis';
import logger from './logger.js';

// Configuración de Redis
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  lazyConnect: true, // No conectar hasta que se necesite
};

// Crear cliente Redis
const redis = new Redis(REDIS_CONFIG);

// Estado de conexión
let isConnected = false;
let isEnabled = process.env.REDIS_ENABLED === 'true';

// Event listeners
redis.on('connect', () => {
  logger.info('Redis: Connecting...');
});

redis.on('ready', () => {
  isConnected = true;
  logger.info('Redis: Connected and ready');
});

redis.on('error', (error) => {
  isConnected = false;
  logger.error('Redis Error:', error);
  
  // Si Redis falla, deshabilitarlo temporalmente
  if (error.code === 'ECONNREFUSED') {
    logger.warn('Redis: Connection refused. Caching will be disabled.');
    isEnabled = false;
  }
});

redis.on('close', () => {
  isConnected = false;
  logger.warn('Redis: Connection closed');
});

redis.on('reconnecting', (delay) => {
  logger.info(`Redis: Reconnecting in ${delay}ms...`);
});

/**
 * Inicializar conexión Redis
 */
const connect = async () => {
  if (!isEnabled) {
    logger.info('Redis: Disabled by configuration');
    return false;
  }
  
  try {
    await redis.connect();
    return true;
  } catch (error) {
    logger.error('Redis: Failed to connect:', error);
    isEnabled = false;
    return false;
  }
};

/**
 * Verificar si Redis está disponible
 */
const isAvailable = () => {
  return isEnabled && isConnected;
};

/**
 * Get value from cache
 */
const get = async (key) => {
  if (!isAvailable()) return null;
  
  try {
    const value = await redis.get(key);
    if (value) {
      logger.debug(`Redis: Cache HIT for key "${key}"`);
      return JSON.parse(value);
    }
    logger.debug(`Redis: Cache MISS for key "${key}"`);
    return null;
  } catch (error) {
    logger.error(`Redis: Error getting key "${key}":`, error);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
const set = async (key, value, ttl = 300) => {
  if (!isAvailable()) return false;
  
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);
    logger.debug(`Redis: Cached key "${key}" with TTL ${ttl}s`);
    return true;
  } catch (error) {
    logger.error(`Redis: Error setting key "${key}":`, error);
    return false;
  }
};

/**
 * Delete key from cache
 */
const del = async (key) => {
  if (!isAvailable()) return false;
  
  try {
    await redis.del(key);
    logger.debug(`Redis: Deleted key "${key}"`);
    return true;
  } catch (error) {
    logger.error(`Redis: Error deleting key "${key}":`, error);
    return false;
  }
};

/**
 * Delete multiple keys matching pattern
 */
const delPattern = async (pattern) => {
  if (!isAvailable()) return 0;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Redis: Deleted ${keys.length} keys matching "${pattern}"`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    logger.error(`Redis: Error deleting pattern "${pattern}":`, error);
    return 0;
  }
};

/**
 * Clear all cache
 */
const flushAll = async () => {
  if (!isAvailable()) return false;
  
  try {
    await redis.flushdb();
    logger.info('Redis: All cache cleared');
    return true;
  } catch (error) {
    logger.error('Redis: Error clearing cache:', error);
    return false;
  }
};

/**
 * Get cache statistics
 */
const getStats = async () => {
  if (!isAvailable()) {
    return {
      enabled: false,
      connected: false,
    };
  }
  
  try {
    const info = await redis.info('stats');
    const keyspace = await redis.info('keyspace');
    
    return {
      enabled: true,
      connected: true,
      stats: info,
      keyspace: keyspace,
    };
  } catch (error) {
    logger.error('Redis: Error getting stats:', error);
    return {
      enabled: true,
      connected: false,
      error: error.message,
    };
  }
};

/**
 * Graceful shutdown
 */
const disconnect = async () => {
  try {
    await redis.quit();
    logger.info('Redis: Disconnected gracefully');
  } catch (error) {
    logger.error('Redis: Error during disconnect:', error);
  }
};

export default {
  redis,
  connect,
  isAvailable,
  get,
  set,
  del,
  delPattern,
  flushAll,
  getStats,
  disconnect,
};
