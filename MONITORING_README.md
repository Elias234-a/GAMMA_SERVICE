# 📊 Sistema de Logs y Monitoreo - GAMMA Service ERP

## 📋 Descripción

Sistema completo de logging, monitoreo y error tracking para producción con Winston, Sentry y dashboard en tiempo real.

---

## 🎯 Componentes Implementados

### 1. **Winston Logger Mejorado** ✅
- Logs estructurados con niveles (error, warn, info, http, debug)
- Rotación diaria automática de archivos
- Logs en formato JSON para análisis
- Logs en consola con colores
- Separación por tipo (error, http, warn, combined)
- Retención de 14 días
- Límite de 20MB por archivo
- Compresión automática (zip)

### 2. **Request Logging Middleware** ✅
- Logging automático de todas las peticiones HTTP
- Tracking de response time
- Captura de errores 4xx y 5xx
- Información de IP y User Agent
- Logs de acciones de usuario

### 3. **Health Check System** ✅
- Endpoint `/api/health` - Estado completo del sistema
- Endpoint `/api/health/live` - Liveness probe (Kubernetes)
- Endpoint `/api/health/ready` - Readiness probe (Kubernetes)
- Endpoint `/api/health/metrics` - Métricas detalladas
- Check de MongoDB
- Métricas de sistema (CPU, RAM, Uptime)

### 4. **Sentry Error Tracking** ✅
- Captura automática de errores
- Stack traces completos
- Context y breadcrumbs
- Email alerts
- Performance monitoring
- Profiling (production)
- Filtrado de datos sensibles

### 5. **Status Monitor Dashboard** ✅
- Dashboard en tiempo real en `/status`
- Gráficos de CPU y RAM
- Response times
- Requests per second
- Status codes
- Health checks visuales

---

## 🚀 URLs Disponibles

### Producción
- **Health Check**: http://localhost:8001/api/health
- **Liveness**: http://localhost:8001/api/health/live
- **Readiness**: http://localhost:8001/api/health/ready
- **Metrics**: http://localhost:8001/api/health/metrics
- **Status Dashboard**: http://localhost:8001/status

---

## 📁 Estructura de Logs

```
backend/logs/
├── combined-2025-10-07.log      # Todos los logs
├── error-2025-10-07.log         # Solo errores
├── http-2025-10-07.log          # Requests HTTP
├── warn-2025-10-07.log          # Warnings
├── exceptions.log               # Excepciones no capturadas
└── rejections.log               # Promise rejections
```

### Formato de Logs

**Consola** (desarrollo):
```
2025-10-07 21:00:00 [info]: 🚀 Servidor corriendo en http://localhost:8001
```

**Archivo** (producción - JSON):
```json
{
  "timestamp": "2025-10-07 21:00:00",
  "level": "info",
  "message": "Servidor corriendo",
  "method": "GET",
  "url": "/api/vehicles",
  "status": 200,
  "responseTime": "45ms",
  "ip": "::1"
}
```

---

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
cd backend
npm install @sentry/node @sentry/profiling-node express-status-monitor winston-daily-rotate-file
```

### 2. Configurar Sentry (Opcional pero recomendado)

1. **Crear cuenta gratis** en [sentry.io](https://sentry.io)
2. **Crear proyecto** Node.js
3. **Copiar DSN** (Data Source Name)
4. **Agregar a .env**:
   ```bash
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

**Plan gratuito de Sentry**:
- ✅ 5,000 errores/mes gratis
- ✅ Performance monitoring
- ✅ Email alerts
- ✅ 30 días de retención

### 3. Variables de Entorno

```bash
# .env
NODE_ENV=production
SENTRY_DSN=tu_sentry_dsn_aqui
```

---

## 📊 Uso

### Health Checks

#### Verificar estado general
```bash
curl http://localhost:8001/api/health
```

**Response**:
```json
{
  "uptime": 3600,
  "timestamp": 1696723200000,
  "status": "OK",
  "services": {
    "mongodb": {
      "status": "connected",
      "host": "localhost",
      "name": "gamma_service"
    }
  },
  "system": {
    "platform": "linux",
    "memory": {
      "total": "16 GB",
      "free": "8 GB",
      "used": "8 GB",
      "usagePercent": "50%"
    },
    "loadAverage": [1.5, 1.2, 1.0]
  }
}
```

#### Verificar si está vivo (Kubernetes liveness)
```bash
curl http://localhost:8001/api/health/live
```

#### Verificar si está listo (Kubernetes readiness)
```bash
curl http://localhost:8001/api/health/ready
```

#### Ver métricas detalladas
```bash
curl http://localhost:8001/api/health/metrics
```

---

### Logging en Código

#### Log básico
```javascript
import logger from './config/logger.js';

logger.info('Usuario creado exitosamente');
logger.warn('Stock bajo para producto X');
logger.error('Error al procesar pago');
logger.debug('Variable X:', { value: 123 });
```

#### Log de errores con contexto
```javascript
import logger from './config/logger.js';

try {
  // código
} catch (error) {
  logger.logError(error, {
    userId: req.user.id,
    action: 'create_vehicle',
    vehicleId: vehicle.id
  });
}
```

#### Log de request HTTP
```javascript
// Se hace automáticamente por el middleware
// Pero puedes hacerlo manual:
logger.logRequest(req, res, responseTime);
```

#### Log de acción de usuario
```javascript
logger.logUserAction(userId, 'DELETE_VEHICLE', {
  vehicleId: '12345',
  vehiclePlate: 'ABC123'
});
```

---

### Sentry Error Tracking

#### Captura automática
Los errores se capturan automáticamente si:
- Status code >= 500
- Excepciones no capturadas
- Promise rejections

#### Captura manual
```javascript
import { captureException, captureMessage, addBreadcrumb } from './config/sentry.js';

// Capturar excepción
try {
  // código
} catch (error) {
  captureException(error, {
    userId: req.user.id,
    extra: { vehicleId: '123' }
  });
}

// Capturar mensaje
captureMessage('Operación importante completada', 'info', {
  userId: '123'
});

// Agregar breadcrumb (rastro)
addBreadcrumb('Usuario inició checkout', 'user-action', {
  amount: 1000
});
```

#### Set user context
```javascript
import { setUser } from './config/sentry.js';

// En middleware de autenticación
setUser({
  id: user.id,
  email: user.email,
  username: user.name
});
```

---

### Status Monitor Dashboard

1. **Abrir en navegador**: http://localhost:8001/status
2. **Ver en tiempo real**:
   - CPU usage
   - Memory usage
   - Response times
   - Requests per second
   - Status codes distribution

---

## 🔍 Análisis de Logs

### Buscar errores
```bash
cd backend/logs

# Ver errores de hoy
cat error-2025-10-07.log | grep "500"

# Contar errores por tipo
cat combined-*.log | jq -r '.level' | sort | uniq -c

# Ver requests lentos (>1s)
cat http-*.log | jq 'select(.responseTime > 1000)'

# Ver errores por usuario
cat combined-*.log | jq 'select(.level=="error") | .userId' | sort | uniq -c
```

### Monitoreo en producción

#### Con herramientas externas (recomendado):
- **Papertrail**: Logs centralizados
- **DataDog**: APM completo
- **Grafana + Loki**: Open source
- **ELK Stack**: Enterprise

#### Configurar alertas:
```javascript
// Ejemplo con email
if (errorCount > 100) {
  sendAlert('admin@company.com', 'High error rate detected');
}
```

---

## 🐛 Troubleshooting

### Logs no se crean

**Problema**: No se generan archivos de log

**Solución**:
```bash
# Crear directorio de logs
mkdir -p backend/logs
chmod 755 backend/logs

# Verificar permisos
ls -la backend/logs
```

---

### Sentry no captura errores

**Problema**: Sentry no recibe errores

**Solución**:
1. Verificar `SENTRY_DSN` en .env
2. Verificar que no esté en modo test
3. Revisar logs de consola para mensajes de Sentry

```bash
# Ver logs de inicialización
grep "Sentry" backend/logs/combined-*.log
```

---

### Dashboard no carga

**Problema**: `/status` muestra 404

**Solución**:
```bash
# Verificar que express-status-monitor esté instalado
npm list express-status-monitor

# Reinstalar si es necesario
npm install express-status-monitor
```

---

### Logs ocupan mucho espacio

**Solución**:
```javascript
// Ajustar retención en config/logger.js
maxFiles: '7d',  // Cambiar de 14d a 7d
maxSize: '10m',  // Cambiar de 20m a 10m
```

---

## 📈 Métricas a Monitorear

### Métricas Clave (KPIs)

#### Performance
- ✅ Response time promedio (<200ms)
- ✅ P95 response time (<500ms)
- ✅ P99 response time (<1s)
- ✅ Request rate (RPS)

#### Errores
- ✅ Error rate (<1%)
- ✅ 5xx errors (0 ideal)
- ✅ 4xx errors (normal user errors)

#### Sistema
- ✅ CPU usage (<70%)
- ✅ Memory usage (<80%)
- ✅ Disk space (>20% free)
- ✅ Uptime (>99.9%)

#### Base de Datos
- ✅ MongoDB connection time (<100ms)
- ✅ Query time (<50ms)
- ✅ Connection pool availability

---

## 🎯 Alertas Recomendadas

### Críticas (Respuesta inmediata)
- 🚨 Error rate > 5%
- 🚨 5xx errors > 10/min
- 🚨 MongoDB desconectado
- 🚨 Uptime < 1 minuto
- 🚨 Disk space < 10%

### Importantes (Revisar en horas)
- ⚠️ Error rate > 1%
- ⚠️ Response time P95 > 1s
- ⚠️ Memory usage > 85%
- ⚠️ CPU usage > 80%

### Informativas (Revisar diario)
- ℹ️ Deployment completado
- ℹ️ Backup exitoso
- ℹ️ Logs rotados

---

## 🔐 Seguridad en Logs

### Datos a NO loguear:
❌ Passwords  
❌ Tokens JWT completos  
❌ Números de tarjeta  
❌ Datos personales sensibles  
❌ API keys  

### Datos seguros para loguear:
✅ User IDs (no emails)  
✅ Request paths  
✅ Status codes  
✅ Response times  
✅ IP addresses (anonimizadas)  
✅ Error messages (sin data sensible)  

### Filtrado implementado:
```javascript
// En sentry.js
beforeSend(event, hint) {
  // Remover datos sensibles
  delete event.request.cookies;
  delete event.request.headers['authorization'];
  return event;
}
```

---

## 📊 Dashboard Personalizado (Futuro)

### Con Grafana
1. Instalar Grafana
2. Conectar a Loki (logs)
3. Conectar a Prometheus (métricas)
4. Crear dashboards personalizados

### Con Datadog
1. Instalar agent
2. Configurar API key
3. Dashboards automáticos

---

## ✅ Checklist de Producción

Antes de deploy:

- [ ] Winston configurado con rotación
- [ ] Sentry DSN configurado
- [ ] Health checks funcionando
- [ ] Status monitor accesible
- [ ] Logs no contienen datos sensibles
- [ ] Alertas configuradas
- [ ] Backup de logs configurado
- [ ] Retención de logs definida (14 días)
- [ ] Monitoreo de disk space
- [ ] Documentación actualizada

---

## 💰 Costos

### Gratis
- ✅ Winston (open source)
- ✅ Express Status Monitor (open source)
- ✅ Sentry free tier (5k errors/mes)

### Pagados (opcional)
- Sentry Pro: $26/mes (50k errors)
- Papertrail: $7/mes (1GB logs)
- DataDog: $15/mes por host
- Grafana Cloud: $49/mes

---

## 🎓 Mejores Prácticas

### DO ✅
- Loguear todos los errores
- Usar niveles apropiados (error, warn, info)
- Agregar contexto a los logs
- Rotar logs regularmente
- Monitorear métricas clave
- Configurar alertas
- Revisar logs regularmente

### DON'T ❌
- Loguear datos sensibles
- Ignorar warnings
- Dejar logs sin revisar
- No configurar alertas
- Logs sin contexto
- No rotar logs (llenan disk)
- Loguear TODO en producción

---

## 📚 Recursos

- [Winston Docs](https://github.com/winstonjs/winston)
- [Sentry Docs](https://docs.sentry.io/)
- [Express Status Monitor](https://github.com/RafalWilinski/express-status-monitor)
- [Log Rotation Best Practices](https://www.loggly.com/ultimate-guide/managing-and-rotating-logs/)

---

**¡Sistema de monitoreo completo y listo para producción!** 🎉

Para empezar:
```bash
cd backend
npm install
npm run dev
```

Luego accede a:
- http://localhost:8001/status
- http://localhost:8001/api/health
