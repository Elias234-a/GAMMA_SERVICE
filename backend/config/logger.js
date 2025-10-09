import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para los niveles de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aplicar colores
winston.addColors(colors);

// Determinar el nivel de log según el ambiente
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Formato para consola (con colores)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    }
  ),
);

// Formato para archivos (JSON estructurado)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuración de rotación diaria para logs
const dailyRotateFileTransport = (level, filename) => {
  return new winston.transports.DailyRotateFile({
    level,
    filename: path.join(__dirname, `../logs/${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Mantener logs por 14 días
    format: fileFormat,
  });
};

// Opciones de transporte
const transports = [
  // Console (development)
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Logs combinados con rotación diaria
  dailyRotateFileTransport('info', 'combined'),
  
  // Solo errores con rotación diaria
  dailyRotateFileTransport('error', 'error'),
  
  // Logs de HTTP requests
  dailyRotateFileTransport('http', 'http'),
  
  // Warnings
  dailyRotateFileTransport('warn', 'warn'),
];

// Crear el logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log'),
      format: fileFormat,
    })
  ],
  // Manejar rechazos de promesas no capturados
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/rejections.log'),
      format: fileFormat,
    })
  ]
});

// Stream para Morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Métodos de utilidad
logger.logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context
  });
};

logger.logRequest = (req, res, responseTime) => {
  logger.http({
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

logger.logUserAction = (userId, action, details = {}) => {
  logger.info({
    type: 'USER_ACTION',
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export default logger;
