import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/**
 * Middleware para logging automático de auditoría
 */
export const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Guardar el método original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json para capturar la respuesta
    res.json = function(data) {
      // Crear log de auditoría
      AuditLog.log({
        user: req.user,
        action,
        resource,
        resourceId: req.params.id || data?.data?.id || data?.data?._id,
        details: {
          query: req.query,
          params: req.params
        },
        req,
        statusCode: res.statusCode,
        severity: res.statusCode >= 400 ? 'warning' : 'info'
      }).catch(err => {
        logger.error('Error creating audit log:', err);
      });
      
      // Llamar al método original
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Log de cambios en UPDATE operations
 */
export const auditChanges = (resource) => {
  return async (req, res, next) => {
    // Guardar datos anteriores si existe el recurso
    if (req.params.id) {
      try {
        const Model = mongoose.model(resource);
        req.originalData = await Model.findById(req.params.id).lean();
      } catch (error) {
        // Continuar si no se puede obtener
      }
    }
    
    // Guardar el método original res.json
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Log con cambios si hay datos originales
      if (req.originalData && data?.data) {
        AuditLog.log({
          user: req.user,
          action: 'UPDATE',
          resource,
          resourceId: req.params.id,
          changes: {
            before: req.originalData,
            after: data.data
          },
          req,
          statusCode: res.statusCode
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Log de autenticación
 */
export const auditAuth = async (user, action, req, success = true) => {
  await AuditLog.log({
    user: user?._id,
    userId: user?.id,
    userEmail: user?.email,
    action,
    resource: 'User',
    resourceId: user?.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    method: req.method,
    path: req.originalUrl,
    statusCode: success ? 200 : 401,
    severity: success ? 'info' : 'warning'
  });
};

/**
 * Log de acceso denegado
 */
export const auditAccessDenied = async (req, reason) => {
  await AuditLog.log({
    user: req.user?._id,
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'PERMISSION_DENIED',
    details: { reason },
    req,
    statusCode: 403,
    severity: 'warning'
  });
};

/**
 * Log de actividad sospechosa
 */
export const auditSuspiciousActivity = async (req, details) => {
  await AuditLog.log({
    user: req.user?._id,
    action: 'SUSPICIOUS_ACTIVITY',
    details,
    req,
    severity: 'error'
  });
};

/**
 * Middleware para detectar actividad sospechosa
 */
export const detectSuspiciousActivity = async (req, res, next) => {
  try {
    // Verificar actividad sospechosa en la última hora
    const suspicious = await AuditLog.findSuspiciousActivity();
    
    // Si la IP actual está en la lista de IPs sospechosas
    const currentIp = req.ip;
    const suspiciousIp = suspicious.failedLogins.find(f => f._id === currentIp);
    
    if (suspiciousIp && suspiciousIp.count >= 10) {
      await auditSuspiciousActivity(req, {
        reason: 'Multiple failed login attempts',
        attempts: suspiciousIp.count,
        lastAttempt: suspiciousIp.lastAttempt
      });
      
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Error detecting suspicious activity:', error);
  }
  
  next();
};

export default {
  auditMiddleware,
  auditChanges,
  auditAuth,
  auditAccessDenied,
  auditSuspiciousActivity,
  detectSuspiciousActivity
};
