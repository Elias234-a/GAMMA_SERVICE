import { Router } from 'express';
import * as dianController from '../controllers/dianController.js';
import { auth } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

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

// Validaciones comunes
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validación de identificación (NIT, Cédula, etc.)
const validateIdentification = (value, { req }) => {
  const { identificationType } = req.body.customer || {};
  
  // Validación básica de identificación
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error('La identificación es requerida');
  }
  
  // Validación según el tipo de identificación
  if (identificationType === 'nit') {
    // Validación básica de NIT (puedes ajustar según los requisitos de la DIAN)
    if (!/^\d{9}(-\d{1})?$/.test(value)) {
      throw new Error('Formato de NIT inválido. Debe tener el formato 123456789-0');
    }
  } else if (identificationType === 'cc') {
    // Validación básica de cédula colombiana
    if (!/^\d{8,10}$/.test(value)) {
      throw new Error('Formato de cédula inválido. Debe contener entre 8 y 10 dígitos');
    }
  }
  
  return true;
};

// Validación de dirección
const validateAddress = (address) => {
  if (!address || typeof address !== 'object') {
    throw new Error('La dirección es requerida');
  }
  
  const { street, city, department, country, postalCode } = address;
  
  if (!street || typeof street !== 'string' || street.trim() === '') {
    throw new Error('La dirección (calle) es requerida');
  }
  
  if (!city || typeof city !== 'string' || city.trim() === '') {
    throw new Error('La ciudad es requerida');
  }
  
  if (!department || typeof department !== 'string' || department.trim() === '') {
    throw new Error('El departamento es requerido');
  }
  
  if (!country || typeof country !== 'string' || country.trim() === '') {
    throw new Error('El país es requerido');
  }
  
  if (postalCode && (typeof postalCode !== 'string' || !/^\d{5,10}$/.test(postalCode))) {
    throw new Error('Código postal inválido. Debe contener entre 5 y 10 dígitos');
  }
  
  return true;
};

// Validación de ítems de factura
const validateInvoiceItems = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un ítem')
    .custom(items => {
      return items.every((item, index) => {
        if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
          throw new Error(`El ítem en la posición ${index} debe tener una descripción`);
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          throw new Error(`La cantidad del ítem "${item.description}" debe ser mayor a 0`);
        }
        if (typeof item.price !== 'number' || item.price < 0) {
          throw new Error(`El precio del ítem "${item.description}" debe ser un número positivo`);
        }
        if (item.tax && (typeof item.tax !== 'number' || item.tax < 0 || item.tax > 100)) {
          throw new Error(`El impuesto del ítem "${item.description}" debe estar entre 0 y 100`);
        }
        return true;
      });
    })
];

// Validación de factura
const validateInvoice = [
  body('orderId')
    .custom(validateObjectId)
    .withMessage('ID de orden no válido'),
  body('customer')
    .isObject()
    .withMessage('Datos del cliente son requeridos')
    .custom(customer => {
      if (!customer.identificationType || !['nit', 'cc', 'ce', 'passport', 'idc', 'idp'].includes(customer.identificationType)) {
        throw new Error('Tipo de identificación inválido. Debe ser: nit, cc, ce, passport, idc o idp');
      }
      return true;
    }),
  body('customer.identification')
    .custom(validateIdentification),
  body('customer.name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del cliente es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('customer.phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Número de teléfono inválido'),
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),
  body('customer.address')
    .custom(validateAddress),
  body('paymentMethod')
    .optional()
    .isIn(['contado', 'credito', 'tarjeta', 'transferencia', 'efectivo'])
    .withMessage('Método de pago no válido'),
  body('paymentDueDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento de pago inválida')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === 'credito' && !value) {
        throw new Error('La fecha de vencimiento es requerida para pagos a crédito');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder los 1000 caracteres'),
  ...validateInvoiceItems
];

// Validación de anulación de factura
const validateVoidInvoice = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La razón de la anulación es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres'),
  body('replacementInvoiceId')
    .optional()
    .custom(validateObjectId)
    .withMessage('ID de factura de reemplazo no válido')
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
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'void'])
    .withMessage('Estado de factura no válido'),
  query('customerId')
    .optional()
    .custom(validateObjectId)
    .withMessage('ID de cliente no válido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser un entero positivo')
];

// Rutas de facturación electrónica DIAN
router.post(
  '/invoices',
  auth,
  validate(validateInvoice),
  dianController.createInvoice
);

router.get(
  '/invoices',
  auth,
  validate(validateQueryParams),
  dianController.getInvoices
);

router.get(
  '/invoices/:id',
  auth,
  validate([
    param('id')
      .custom(validateObjectId)
      .withMessage('ID de factura no válido')
  ]),
  dianController.getInvoiceStatus
);

router.get(
  '/invoices/:id/pdf',
  auth,
  validate([
    param('id')
      .custom(validateObjectId)
      .withMessage('ID de factura no válido')
  ]),
  dianController.downloadPdf
);

router.post(
  '/invoices/:id/void',
  auth,
  validate([
    param('id')
      .custom(validateObjectId)
      .withMessage('ID de factura no válido'),
    ...validateVoidInvoice
  ]),
  dianController.voidInvoice
);

export default router;
