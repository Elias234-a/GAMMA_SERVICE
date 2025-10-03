import axios from 'axios';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Datacredito from '../models/Datacredito.js';
import { createNotification } from '../utils/notifications.js';

// Configuración de la API de Datacrédito
const DATACREDITO_API_URL = process.env.DATACREDITO_API_URL || 'https://api.datacredito.com.co';
const DATACREDITO_API_KEY = process.env.DATACREDITO_API_KEY;

if (!DATACREDITO_API_KEY) {
  console.warn('ADVERTENCIA: No se ha configurado la API key de Datacrédito');
}

/**
 * Cliente para hacer peticiones a la API de Datacrédito
 */
const datacreditoClient = axios.create({
  baseURL: DATACREDITO_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DATACREDITO_API_KEY}`,
    'x-request-id': uuidv4()
  }
});
/**
 * Consulta el historial crediticio de una persona
 * @route POST /api/datacredito/consult
 * @access private
 */
export const consultCreditReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identification, identificationType, firstName, lastName, email, phone } = req.body;

    // Verificar si ya existe una consulta reciente (evitar consultas duplicadas)
    
    // Verificar si ya existe una consulta reciente (evitar consultas duplicadas)
    const recentQuery = await Datacredito.findOne({
      'identification.number': identification,
      'identification.type': identificationType,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Últimas 24 horas
    }).sort({ createdAt: -1 });

    if (recentQuery) {
      return res.json({
        message: 'Consulta reciente encontrada',
        report: recentQuery,
        cached: true
      });
    }

    // En producción, realizar la consulta real a Datacrédito
    let datacreditoResponse;
    if (process.env.NODE_ENV === 'production' && DATACREDITO_API_KEY) {
      const response = await datacreditoClient.post('/v2/reports/credit-report', {
        identification: {
          type: identificationType || 'CC', // CC, CE, NIT, etc.
          number: identification
        },
        customer: {
          firstName,
          lastName,
          email,
          phone
        },
        reportType: 'full', // full, score, basic
        requestReason: 'Crédito' // Crédito, Comercial, Seguridad, etc.
      });
      
      datacreditoResponse = response.data;
    } else {
      // En desarrollo o sin API key, devolver datos de prueba
      datacreditoResponse = {
        status: 'success',
        reportId: `TEST-${uuidv4()}`,
        score: Math.floor(Math.random() * 300) + 500, // Puntaje aleatorio entre 500-800
        reportDate: new Date().toISOString(),
        summary: {
          openAccounts: Math.floor(Math.random() * 10),
          closedAccounts: Math.floor(Math.random() * 20),
          delinquentAccounts: Math.floor(Math.random() * 3),
          totalDebt: Math.floor(Math.random() * 10000000),
          availableCredit: Math.floor(Math.random() * 5000000)
        },
        alerts: [],
        inquiries: []
      };
    }

    // Guardar la consulta en la base de datos
    const creditReport = new Datacredito({
      identification: {
        type: identificationType || 'CC',
        number: identification
      },
      customer: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone
      },
      report: datacreditoResponse,
      score: datacreditoResponse.score,
      status: datacreditoResponse.status || 'completed',
      requestedBy: req.user._id,
      requestReason: 'Crédito',
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await creditReport.save();

    // Notificar al usuario que solicitó el informe
    await createNotification(
      req.user._id,
      'info',
      'Consulta de Datacrédito',
      `Se ha generado el informe de crédito para ${identification}`,
      { reportId: creditReport._id }
    );

    res.json({
      message: 'Consulta de Datacrédito exitosa',
      report: creditReport,
      cached: false
    });

  } catch (error) {
    console.error('Error al consultar Datacrédito:', error);
    
    // Manejar errores específicos de la API de Datacrédito
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al consultar Datacrédito',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};

/**
 * Obtiene el historial de consultas de Datacrédito
 * @route GET /api/datacredito/history
 * @access private
 */
export const getConsultationHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, identification, page = 1, limit = 10 } = req.query;
    
    const query = { requestedBy: req.user._id };
    
    // Filtros
    if (identification) {
      query['identification.number'] = identification;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    
    const [reports, total] = await Promise.all([
      Datacredito.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-report -metadata'),
      Datacredito.countDocuments(query)
    ]);
    
    res.json({
      reports,
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

/**
 * Obtiene los detalles de un informe específico
 * @route GET /api/datacredito/reports/:id
 * @access private
 */
export const getReportDetails = async (req, res, next) => {
  try {
    const report = await Datacredito.findOne({
      _id: req.params.id,
      $or: [
        { requestedBy: req.user._id },
        { 'customer.email': req.user.email }
      ]
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado o acceso no autorizado' });
    }
    
    // Formatear la respuesta para el cliente
    const response = {
      id: report._id,
      identification: report.identification,
      customer: report.customer,
      score: report.score,
      status: report.status,
      createdAt: report.createdAt,
      summary: report.report?.summary,
      alerts: report.report?.alerts || [],
      inquiries: report.report?.inquiries || [],
      accounts: report.report?.accounts || []
    };
    
    res.json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Configura las alertas de monitoreo de crédito
 * @route POST /api/datacredito/alerts
 * @access private
 */
export const setupCreditAlerts = async (req, res, next) => {
  try {
    const { identification, identificationType, email, phone, alertTypes } = req.body;
    
    // En producción, registrar las alertas en Datacrédito
    if (process.env.NODE_ENV === 'production' && DATACREDITO_API_KEY) {
      await datacreditoClient.post('/v1/alerts', {
        identification: {
          type: identificationType || 'CC',
          number: identification
        },
        contact: { email, phone },
        alertTypes: alertTypes || ['score_change', 'new_account', 'credit_inquiry'],
        frequency: 'daily', // o 'weekly', 'immediate'
        status: 'active'
      });
    }
    
    // Guardar preferencias de alerta en la base de datos
    // (implementar según el modelo de usuario o configuración)
    
    res.json({
      message: 'Alertas de crédito configuradas correctamente',
      alerts: alertTypes || ['score_change', 'new_account', 'credit_inquiry']
    });
    
  } catch (error) {
    console.error('Error al configurar alertas de crédito:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al configurar alertas',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};

/**
 * Valida la autenticidad de un documento de identidad
 * @route POST /api/datacredito/validate-id
 * @access private
 */
export const validateIdentity = async (req, res, next) => {
  try {
    const { identification, identificationType, firstName, lastName, birthDate } = req.body;
    
    // En producción, validar con Datacrédito
    let validationResult;
    if (process.env.NODE_ENV === 'production' && DATACREDITO_API_KEY) {
      const response = await datacreditoClient.post('/v1/identity/validate', {
        identification: {
          type: identificationType || 'CC',
          number: identification
        },
        firstName,
        lastName,
        birthDate
      });
      
      validationResult = response.data;
    } else {
      // Simular validación en desarrollo
      validationResult = {
        valid: Math.random() > 0.1, // 90% de probabilidad de ser válido
        score: Math.floor(Math.random() * 100),
        details: {
          nameMatch: Math.random() > 0.2, // 80% de coincidencia de nombre
          birthDateMatch: Math.random() > 0.1, // 90% de coincidencia de fecha
          status: 'active' // active, inactive, deceased, etc.
        }
      };
    }
    
    // Registrar la validación
    const validationRecord = new Datacredito({
      identification: {
        type: identificationType || 'CC',
        number: identification
      },
      customer: { name: `${firstName} ${lastName}`.trim() },
      type: 'identity_validation',
      status: validationResult.valid ? 'valid' : 'invalid',
      score: validationResult.score,
      details: validationResult.details,
      requestedBy: req.user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    await validationRecord.save();
    
    res.json({
      message: 'Validación de identidad completada',
      valid: validationResult.valid,
      score: validationResult.score,
      details: validationResult.details,
      validationId: validationRecord._id
    });
    
  } catch (error) {
    console.error('Error al validar identidad:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status || 500).json({
        message: 'Error al validar identidad',
        error: data.message || 'Error desconocido'
      });
    }
    
    next(error);
  }
};
