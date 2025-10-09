import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Usuario que realizó la acción
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userId: {
    type: String, // Backup por si se elimina el usuario
    index: true
  },
  userEmail: {
    type: String
  },
  
  // Tipo de acción
  action: {
    type: String,
    required: true,
    enum: [
      // Autenticación
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
      'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_CHANGED',
      '2FA_ENABLED', '2FA_DISABLED', '2FA_VERIFIED',
      
      // CRUD Operations
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      
      // Seguridad
      'PERMISSION_DENIED', 'UNAUTHORIZED_ACCESS',
      'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY',
      
      // Administración
      'USER_CREATED', 'USER_DELETED', 'ROLE_CHANGED',
      'SETTINGS_CHANGED', 'SYSTEM_CONFIG_CHANGED',
      
      // Datos
      'DATA_EXPORT', 'DATA_IMPORT', 'BULK_DELETE'
    ],
    index: true
  },
  
  // Recurso afectado
  resource: {
    type: String, // 'User', 'Vehicle', 'Order', etc.
    index: true
  },
  resourceId: {
    type: String
  },
  
  // Detalles de la acción
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Cambios realizados (para UPDATE)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // Información de la request
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: {
    type: String
  },
  method: {
    type: String // GET, POST, PUT, DELETE
  },
  path: {
    type: String
  },
  statusCode: {
    type: Number
  },
  
  // Severidad
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  },
  
  // Metadata adicional
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices compuestos para queries comunes
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// TTL index - Eliminar logs antiguos automáticamente (opcional)
// Descomentar para mantener logs solo 90 días
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Método estático para crear log de auditoría
auditLogSchema.statics.log = async function(data) {
  try {
    return await this.create({
      user: data.user?._id || data.userId,
      userId: data.user?.id || data.userId,
      userEmail: data.user?.email || data.userEmail,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      changes: data.changes,
      ipAddress: data.ipAddress || data.req?.ip,
      userAgent: data.userAgent || data.req?.get('user-agent'),
      method: data.method || data.req?.method,
      path: data.path || data.req?.originalUrl,
      statusCode: data.statusCode,
      severity: data.severity || 'info',
      metadata: data.metadata
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // No lanzar error para no interrumpir la operación principal
  }
};

// Método estático para buscar actividad sospechosa
auditLogSchema.statics.findSuspiciousActivity = async function(timeWindow = 3600000) {
  const since = new Date(Date.now() - timeWindow);
  
  // Múltiples intentos de login fallidos
  const failedLogins = await this.aggregate([
    {
      $match: {
        action: 'LOGIN_FAILED',
        timestamp: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        lastAttempt: { $max: '$timestamp' }
      }
    },
    {
      $match: { count: { $gte: 5 } }
    }
  ]);
  
  // Accesos no autorizados frecuentes
  const unauthorized = await this.aggregate([
    {
      $match: {
        action: { $in: ['PERMISSION_DENIED', 'UNAUTHORIZED_ACCESS'] },
        timestamp: { $gte: since }
      }
    },
    {
      $group: {
        _id: { user: '$userId', ip: '$ipAddress' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gte: 10 } }
    }
  ]);
  
  return {
    failedLogins,
    unauthorized
  };
};

// Método estático para obtener actividad de usuario
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Método estático para obtener estadísticas
auditLogSchema.statics.getStats = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
