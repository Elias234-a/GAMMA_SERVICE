import expressStatusMonitor from 'express-status-monitor';

/**
 * Configuración del dashboard de monitoreo en tiempo real
 * Accesible en: /status
 */
export const monitoringConfig = expressStatusMonitor({
  title: 'GAMMA Service ERP - Status Monitor',
  theme: 'default.css',
  path: '/status',
  
  // Intervalo de actualización (ms)
  spans: [{
    interval: 1,      // Cada 1 segundo
    retention: 60     // Mantener 60 mediciones
  }, {
    interval: 5,      // Cada 5 segundos
    retention: 60
  }, {
    interval: 15,     // Cada 15 segundos
    retention: 60
  }],
  
  // Chart propiedades
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,            // Requests per second
    statusCodes: true
  },
  
  // Health checks
  healthChecks: [
    {
      protocol: 'http',
      host: 'localhost',
      path: '/api/health',
      port: process.env.PORT || 8001
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/api/health/ready',
      port: process.env.PORT || 8001
    }
  ],
  
  // Ignorar ciertos paths en las métricas
  ignoreStartsWith: '/status'
});

export default monitoringConfig;
