import axios from 'axios';
import { validationResult } from 'express-validator';
import Transito from '../models/Transito.js';
import { createNotification } from '../utils/notifications.js';

// Configuración de la API de Tránsito
const TRANSITO_API_URL = process.env.TRANSITO_API_URL || 'https://api.transito.com.co';
const TRANSITO_API_KEY = process.env.TRANSITO_API_KEY;

if (!TRANSITO_API_KEY) {
  console.warn('ADVERTENCIA: No se ha configurado la API key del servicio de Tránsito');
}

/**
 * Cliente para hacer peticiones a la API de Tránsito
 */
const transitoClient = axios.create({
  baseURL: TRANSITO_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TRANSITO_API_KEY}`,
    'X-Requested-With': 'XMLHttpRequest'
  }
});

/**
 * Consulta la información de un vehículo por placa
 * @route POST /api/transito/vehiculo
 * @access private
 */
export const consultarVehiculo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { placa, tipoConsulta = 'basica' } = req.body;
    
    // Verificar si ya existe una consulta reciente (últimas 24 horas)
    const consultaReciente = await Transito.findOne({
      'vehiculo.placa': placa.toUpperCase(),
      tipo: 'consulta_vehiculo',
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (consultaReciente) {
      return res.json({
        message: 'Consulta reciente encontrada',
        datos: consultaReciente.datos,
        cache: true,
        fechaConsulta: consultaReciente.createdAt
      });
    }

    // En producción, realizar la consulta real al servicio de Tránsito
    let datosVehiculo;
    if (process.env.NODE_ENV === 'production' && TRANSITO_API_KEY) {
      const response = await transitoClient.post('/vehiculos/consultar', {
        placa: placa.toUpperCase(),
        tipoConsulta
      });
      
      datosVehiculo = response.data;
    } else {
      // Datos de prueba para desarrollo
      datosVehiculo = {
        placa: placa.toUpperCase(),
        marca: 'TOYOTA',
        linea: 'HILUX',
        modelo: '2020',
        color: 'BLANCO',
        tipo: 'CAMIONETA',
        servicio: 'PARTICULAR',
        cilindraje: '2393',
        capacidad: '5',
        vin: '9BGRNRKGXLG501234',
        motor: '2KD1234567',
        chasis: 'MNTKRBS40JY123456',
        propietario: {
          tipoDocumento: 'CC',
          documento: '1234567890',
          nombre: 'JUAN PEREZ',
          direccion: 'CALLE 123 #45-67',
          ciudad: 'BOGOTÁ D.C.'
        },
        estado: 'ACTIVO',
        sanciones: [],
        revisionTecnicoMecanica: {
          vigente: true,
          fechaVencimiento: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        soat: {
          vigente: true,
          aseguradora: 'SEGUROS DEL ESTADO',
          numeroPoliza: 'PSO-123456789',
          fechaVencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
    }

    // Guardar la consulta en la base de datos
    const registroConsulta = new Transito({
      tipo: 'consulta_vehiculo',
      vehiculo: {
        placa: placa.toUpperCase(),
        datos: datosVehiculo
      },
      solicitadoPor: req.user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await registroConsulta.save();

    // Notificar al usuario
    await createNotification(
      req.user._id,
      'info',
      'Consulta de Vehículo',
      `Se ha consultado la información del vehículo placa ${placa}`,
      { placa: placa.toUpperCase(), consultaId: registroConsulta._id }
    );

    res.json({
      message: 'Consulta realizada con éxito',
      datos: datosVehiculo,
      cache: false,
      fechaConsulta: new Date()
    });

  } catch (error) {
    console.error('Error al consultar vehículo:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al consultar el vehículo',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};

/**
 * Consulta las infracciones de tránsito de un vehículo o conductor
 * @route POST /api/transito/infracciones
 * @access private
 */
export const consultarInfracciones = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tipo, placa, documento, tipoDocumento = 'CC' } = req.body;
    
    if (!['vehiculo', 'conductor'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de consulta no válido' });
    }

    // En producción, realizar la consulta real al servicio de Tránsito
    let infracciones = [];
    if (process.env.NODE_ENV === 'production' && TRANSITO_API_KEY) {
      const endpoint = tipo === 'vehiculo' 
        ? '/infracciones/vehiculo'
        : '/infracciones/conductor';
      
      const response = await transitoClient.post(endpoint, {
        ...(tipo === 'vehiculo' ? { placa } : { documento, tipoDocumento })
      });
      
      infracciones = response.data;
    } else {
      // Datos de prueba para desarrollo
      infracciones = [
        {
          numero: '1234567890',
          fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          tipo: tipo === 'vehiculo' ? 'Exceso de velocidad' : 'Paso en rojo',
          articulo: 'Código Nacional de Tránsito, Artículo 132',
          valor: 522000,
          estado: 'PENDIENTE',
          lugar: 'AV BOYACA CON CALLE 45',
          ciudad: 'BOGOTÁ D.C.',
          ...(tipo === 'vehiculo' 
            ? { placa: placa || 'ABC123' } 
            : { 
                conductor: {
                  tipoDocumento,
                  documento,
                  nombre: 'JUAN PEREZ'
                }
              })
        },
        // Más infracciones de ejemplo...
      ];
    }

    // Guardar la consulta en la base de datos
    const registroConsulta = new Transito({
      tipo: 'consulta_infracciones',
      ...(tipo === 'vehiculo' 
        ? { vehiculo: { placa: placa.toUpperCase() } } 
        : { 
            conductor: { 
              tipoDocumento, 
              documento,
              nombre: infracciones[0]?.conductor?.nombre || 'NO ESPECIFICADO'
            } 
          }),
      datos: { infracciones },
      solicitadoPor: req.user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await registroConsulta.save();

    res.json({
      message: 'Consulta de infracciones realizada con éxito',
      total: infracciones.length,
      infracciones,
      fechaConsulta: new Date()
    });

  } catch (error) {
    console.error('Error al consultar infracciones:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al consultar infracciones',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};

/**
 * Consulta el historial de propietarios de un vehículo
 * @route GET /api/transito/historial-propiedad/:placa
 * @access private
 */
export const consultarHistorialPropiedad = async (req, res, next) => {
  try {
    const { placa } = req.params;
    
    // Verificar si ya existe una consulta reciente (últimos 7 días)
    const consultaReciente = await Transito.findOne({
      'vehiculo.placa': placa.toUpperCase(),
      tipo: 'historial_propiedad',
      createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (consultaReciente) {
      return res.json({
        message: 'Consulta reciente encontrada',
        historial: consultaReciente.datos.historial,
        cache: true,
        fechaConsulta: consultaReciente.createdAt
      });
    }

    // En producción, realizar la consulta real al servicio de Tránsito
    let historial;
    if (process.env.NODE_ENV === 'production' && TRANSITO_API_KEY) {
      const response = await transitoClient.get(`/vehiculos/${placa}/historial`);
      historial = response.data;
    } else {
      // Datos de prueba para desarrollo
      historial = [
        {
          fecha: '2020-01-15',
          tipo: 'COMPRAVENTA',
          propietario: 'JUAN PEREZ',
          documento: '123456789',
          ciudad: 'BOGOTÁ D.C.',
          notaria: '18',
          ciudadNotaria: 'BOGOTÁ D.C.'
        },
        {
          fecha: '2018-05-22',
          tipo: 'TRASPASO',
          propietario: 'MARIA GARCIA',
          documento: '987654321',
          ciudad: 'MEDELLÍN',
          notaria: '5',
          ciudadNotaria: 'MEDELLÍN'
        }
      ];
    }

    // Guardar la consulta en la base de datos
    const registroConsulta = new Transito({
      tipo: 'historial_propiedad',
      vehiculo: {
        placa: placa.toUpperCase()
      },
      datos: { historial },
      solicitadoPor: req.user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await registroConsulta.save();

    res.json({
      message: 'Historial de propiedad consultado con éxito',
      historial,
      cache: false,
      fechaConsulta: new Date()
    });

  } catch (error) {
    console.error('Error al consultar historial de propiedad:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al consultar el historial de propiedad',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};

/**
 * Consulta el estado de un comparendo
 * @route GET /api/transito/comparendos/:numero
 * @access private
 */
export const consultarComparendo = async (req, res, next) => {
  try {
    const { numero } = req.params;
    
    // En producción, realizar la consulta real al servicio de Tránsito
    let comparendo;
    if (process.env.NODE_ENV === 'production' && TRANSITO_API_KEY) {
      const response = await transitoClient.get(`/comparendos/${numero}`);
      comparendo = response.data;
    } else {
      // Datos de prueba para desarrollo
      comparendo = {
        numero,
        fecha: '2023-05-15T14:30:00Z',
        tipo: 'Comparendo por exceso de velocidad',
        articulo: 'Código Nacional de Tránsito, Artículo 132',
        valor: 522000,
        estado: 'PENDIENTE',
        lugar: 'AV BOYACA CON CALLE 45',
        ciudad: 'BOGOTÁ D.C.',
        vehiculo: {
          placa: 'ABC123',
          tipo: 'AUTOMOVIL',
          marca: 'TOYOTA',
          linea: 'COROLLA',
          modelo: '2020'
        },
        infractor: {
          tipoDocumento: 'CC',
          documento: '123456789',
          nombre: 'JUAN PEREZ',
          direccion: 'CALLE 123 #45-67',
          ciudad: 'BOGOTÁ D.C.'
        },
        pagos: [],
        descuentos: [
          {
            descripcion: 'Pago oportuno (50% de descuento)',
            fechaVencimiento: '2023-06-15',
            valorConDescuento: 261000
          }
        ],
        evidencia: {
          fotos: [],
          video: null
        }
      };
    }

    res.json({
      message: 'Consulta de comparendo realizada con éxito',
      comparendo,
      fechaConsulta: new Date()
    });
  } catch (error) {
    console.error('Error al consultar comparendo:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al consultar el comparendo',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};


/**
 * Consulta el historial de consultas de tránsito realizadas por el usuario
 * @route GET /api/transito/historial
 * @access private
 */
export const consultarHistorialConsultas = async (req, res, next) => {
  try {
    const { tipo, fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;
    
    const query = { 
      solicitadoPor: req.user._id,
      ...(tipo && { tipo })
    };
    
    // Additional query conditions
    
    if (fechaInicio || fechaFin) {
      query.createdAt = {};
      if (fechaInicio) query.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const end = new Date(fechaFin);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    const [consultas, total] = await Promise.all([
      Transito.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-metadata -datos'),
      Transito.countDocuments(query)
    ]);
    
    res.json({
      consultas,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Exportación de todas las funciones
export default {
  consultarVehiculo,
  consultarInfracciones,
  consultarHistorialPropiedad,
  consultarComparendo,
  consultarHistorialConsultas
};
