import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Técnicos y Órdenes',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de gestión de técnicos y órdenes de servicio',
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@empresa.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.empresa.com/v1',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Incluir el token JWT en el encabezado de autorización con el prefijo Bearer.'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token inválido o no proporcionado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'No autorizado' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../models/*.js')
  ]
};

export const specs = swaggerJsdoc(options);
