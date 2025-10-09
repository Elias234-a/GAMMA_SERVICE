import logger from '../config/logger.js';

/**
 * Middleware para logging de requests HTTP
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar la función original res.send
  const originalSend = res.send;
  
  // Override res.send para capturar cuando termina el request
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Log del request
    logger.logRequest(req, res, responseTime);
    
    // Si el response es un error, loguearlo
    if (res.statusCode >= 400) {
      logger.warn({
        type: 'HTTP_ERROR',
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        body: req.body,
        query: req.query
      });
    }
    
    // Llamar a la función original
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para logging de errores
 */
export const errorLogger = (err, req, res, next) => {
  logger.error({
    type: 'ERROR',
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user.id : 'anonymous'
  });
  
  next(err);
};

/**
 * Middleware para logging de acciones de usuario
 */
export const userActionLogger = (action) => {
  return (req, res, next) => {
    if (req.user) {
      logger.logUserAction(req.user.id, action, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });
    }
    next();
  };
};

export default {
  requestLogger,
  errorLogger,
  userActionLogger
};
