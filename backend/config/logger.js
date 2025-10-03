import winston from 'winston';
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

// Formato del log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Opciones de transporte
const transports = [
  // Escribir logs a la consola
  new winston.transports.Console(),
  
  // Escribir todos los logs a combined.log
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    level: 'info',
  }),
  
  // Escribir solo logs de error a error.log
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports,
});

export default logger;
