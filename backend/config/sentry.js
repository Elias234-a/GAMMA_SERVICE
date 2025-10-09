import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import logger from './logger.js';

/**
 * Inicializa Sentry para error tracking
 * Requiere SENTRY_DSN en variables de entorno
 */
export const initSentry = (app) => {
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    logger.warn('SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }
  
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Integrations
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      nodeProfilingIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Filtrar información sensible
    beforeSend(event, hint) {
      // Remover datos sensibles
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }
      
      // No enviar errores de rate limiting
      if (event.message && event.message.includes('Too many requests')) {
        return null;
      }
      
      return event;
    },
    
    // Configuración adicional
    attachStacktrace: true,
    maxBreadcrumbs: 50,
  });
  
  logger.info('Sentry initialized for error tracking');
};

/**
 * Middleware de Sentry para Express
 */
export const sentryMiddleware = {
  // Request handler - debe ir ANTES de todas las rutas
  requestHandler: Sentry.Handlers.requestHandler(),
  
  // Tracing middleware - debe ir ANTES de todas las rutas
  tracingHandler: Sentry.Handlers.tracingHandler(),
  
  // Error handler - debe ir DESPUÉS de todas las rutas
  errorHandler: Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capturar todos los errores 500+
      if (error.status >= 500) {
        return true;
      }
      // Capturar errores sin status code
      if (!error.status) {
        return true;
      }
      return false;
    }
  })
};

/**
 * Captura manual de excepciones
 */
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: context,
    level: 'error'
  });
  logger.logError(error, context);
};

/**
 * Captura manual de mensajes
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    contexts: context
  });
};

/**
 * Agregar contexto de usuario
 */
export const setUser = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role
  });
};

/**
 * Agregar breadcrumb (rastro de actividad)
 */
export const addBreadcrumb = (message, category, data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
};

export default {
  initSentry,
  sentryMiddleware,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb
};
