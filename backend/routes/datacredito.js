import { Router } from 'express';
import * as datacreditoController from '../controllers/datacreditoController.js';
import { auth } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

// Middleware de validación
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  };
};

// Validación de identificación según tipo
const validateIdentification = (value, { req }) => {
  const { identificationType } = req.body;
  
  // Validación básica
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error('La identificación es requerida');
  }
  
  // Validación según tipo de documento
  switch (identificationType) {
    case 'CC': // Cédula de ciudadanía colombiana
      if (!/^\d{8,10}$/.test(value)) {
        throw new Error('La cédula debe contener entre 8 y 10 dígitos');
      }
      break;
      
    case 'CE': // Cédula de extranjería
      if (!/^[a-zA-Z0-9]{6,12}$/.test(value)) {
        throw new Error('Cédula de extranjería inválida');
      }
      break;
      
    case 'NIT': // Número de Identificación Tributaria
      if (!/^\d{9}(-\d{1})?$/.test(value)) {
        throw new Error('Formato de NIT inválido. Debe tener el formato 123456789-0');
      }
      break;
      
    case 'PASAPORTE': // Pasaporte
      if (!/^[a-zA-Z0-9]{6,20}$/.test(value)) {
        throw new Error('Formato de pasaporte inválido');
      }
      break;
      
    default:
      throw new Error('Tipo de identificación no soportado');
  }
  
  return true;
};

// Validación de nombres
const validateName = (field, min = 2, max = 50) => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage(`El campo ${field} es requerido`)
    .isLength({ min, max })
    .withMessage(`El ${field} debe tener entre ${min} y ${max} caracteres`)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
    .withMessage(`El ${field} solo puede contener letras, espacios y guiones`);
};

// Validación de teléfono
const validatePhone = (field, required = true) => {
  if (required) {
    return body(field)
      .trim()
      .notEmpty().withMessage('El teléfono es requerido')
      .matches(/^[+]?[0-9\s-]{7,20}$/)
      .withMessage('Número de teléfono inválido. Use el formato +57 123 456 7890');
  } else {
    return body(field)
      .optional()
      .trim()
      .matches(/^[+]?[0-9\s-]{7,20}$/)
      .withMessage('Número de teléfono inválido. Use el formato +57 123 456 7890');
  }
};

// Validación de email
const validateEmail = (field, required = true) => {
  if (required) {
    return body(field)
      .trim()
      .notEmpty().withMessage('El correo electrónico es requerido')
      .isEmail().withMessage('Correo electrónico inválido')
      .normalizeEmail();
  } else {
    return body(field)
      .optional()
      .trim()
      .isEmail().withMessage('Correo electrónico inválido')
      .normalizeEmail();
  }
};

// Validación de consulta de crédito
const validateCreditCheck = [
  body('identificationType')
    .isIn(['CC', 'CE', 'NIT', 'PASAPORTE'])
    .withMessage('Tipo de identificación no válido. Debe ser: CC, CE, NIT o PASAPORTE'),
  body('identification')
    .custom(validateIdentification),
  validateName('firstName'),
  validateName('lastName'),
  validateName('secondName', 0, 50).optional(),
  validateName('secondLastName', 0, 50).optional(),
  validateEmail('email'),
  validatePhone('phone'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida. Use el formato YYYY-MM-DD')
    .custom(value => {
      const birthDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120); // 120 años atrás
      
      if (birthDate > today) {
        throw new Error('La fecha de nacimiento no puede ser en el futuro');
      }
      
      if (birthDate < minDate) {
        throw new Error('La fecha de nacimiento no puede ser hace más de 120 años');
      }
      
      return true;
    })
];

// Validación de alertas de crédito
const validateAlertSetup = [
  body('identificationType')
    .isIn(['CC', 'CE', 'NIT', 'PASAPORTE'])
    .withMessage('Tipo de identificación no válido'),
  body('identification')
    .custom(validateIdentification),
  validateEmail('email', false),
  validatePhone('phone', false),
  body('alertTypes')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un tipo de alerta')
    .custom(types => {
      const validTypes = ['new_credit', 'credit_inquiry', 'address_change', 'delinquency', 'fraud_alert'];
      const invalidTypes = types.filter(type => !validTypes.includes(type));
      
      if (invalidTypes.length > 0) {
        throw new Error(`Tipos de alerta no válidos: ${invalidTypes.join(', ')}`);
      }
      
      return true;
    }),
  body('notificationMethods')
    .optional()
    .isArray()
    .withMessage('Los métodos de notificación deben ser un arreglo')
    .custom(methods => {
      const validMethods = ['email', 'sms', 'push', 'webhook'];
      const invalidMethods = methods.filter(method => !validMethods.includes(method));
      
      if (invalidMethods.length > 0) {
        throw new Error(`Métodos de notificación no válidos: ${invalidMethods.join(', ')}`);
      }
      
      return true;
    }),
  body('webhookUrl')
    .if((value, { req }) => 
      req.body.notificationMethods && 
      req.body.notificationMethods.includes('webhook')
    )
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('URL del webhook inválida. Debe comenzar con http:// o https://')
];

// Validación de parámetros de consulta
const validateQueryParams = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((endDate, { req }) => {
      if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
      return true;
    }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser un entero positivo')
];

// Rutas de Datacrédito
router.post(
  '/consult',
  auth,
  validate(validateCreditCheck),
  datacreditoController.consultCreditReport
);

router.get(
  '/history',
  auth,
  validate(validateQueryParams),
  datacreditoController.getConsultationHistory
);

router.get(
  '/reports/:id',
  auth,
  validate([
    param('id')
      .matches(/^[a-f\d]{24}$/i)
      .withMessage('ID de reporte inválido')
  ]),
  datacreditoController.getReportDetails
);

router.post(
  '/alerts',
  auth,
  validate(validateAlertSetup),
  datacreditoController.setupCreditAlerts
);

router.post(
  '/validate-id',
  auth,
  validate([
    body('identification')
      .notEmpty()
      .withMessage('La identificación es requerida'),
    body('firstName')
      .notEmpty()
      .withMessage('El primer nombre es requerido'),
    body('lastName')
      .notEmpty()
      .withMessage('El apellido es requerido'),
    body('birthDate')
      .isISO8601()
      .withMessage('Fecha de nacimiento inválida')
  ]),
  datacreditoController.validateIdentity
);

export default router;
