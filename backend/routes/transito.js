import { Router } from 'express';
import * as transitoController from '../controllers/transitoController.js';
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

// Validación de placa de vehículo (formato colombiano)
const validatePlaca = (value) => {
  // Formato: AAA-123 o AAA-12A (antiguo) o AAA123 (nuevo sin guion)
  const placaRegex = /^[A-Z]{3}-?\d{3}$|^[A-Z]{3}-?\d{2}[A-Z]$/i;
  if (!placaRegex.test(value)) {
    throw new Error('Formato de placa inválido. Use AAA123 o AAA-123');
  }
  return true;
};

// Validación de número de documento
const validateDocumentNumber = (value) => {
  // Cédula (8-10 dígitos) o NIT (9-10 dígitos con o sin guion)
  const docRegex = /^\d{8,10}$|^\d{9}-?\d?\d?$/;
  if (!docRegex.test(value)) {
    throw new Error('Número de documento inválido');
  }
  return true;
};

// Validación de consulta de vehículo
const validateVehicleCheck = [
  body('placa')
    .trim()
    .notEmpty()
    .withMessage('La placa es requerida')
    .custom(validatePlaca),
  body('tipoConsulta')
    .optional()
    .isIn(['basica', 'completa'])
    .withMessage('Tipo de consulta inválido. Debe ser "basica" o "completa"')
];

// Validación de consulta de infracciones
const validateInfractionCheck = [
  body('tipo')
    .isIn(['vehiculo', 'conductor'])
    .withMessage('Tipo de consulta inválido. Debe ser "vehiculo" o "conductor"'),
  body('placa')
    .if((value, { req }) => req.body.tipo === 'vehiculo')
    .trim()
    .notEmpty()
    .withMessage('La placa es requerida para consulta de vehículo')
    .custom(validatePlaca),
  body('documento')
    .if((value, { req }) => req.body.tipo === 'conductor')
    .trim()
    .notEmpty()
    .withMessage('El documento es requerido para consulta de conductor')
    .custom(validateDocumentNumber),
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida. Use el formato YYYY-MM-DD')
    .custom((value, { req }) => {
      if (req.body.fechaFin && new Date(value) > new Date(req.body.fechaFin)) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
      return true;
    }),
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida. Use el formato YYYY-MM-DD')
    .custom((value, { req }) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin del día actual
      
      if (new Date(value) > today) {
        throw new Error('La fecha de fin no puede ser futura');
      }
      return true;
    })
];

// Validación de parámetros de consulta
const validateQueryParams = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
    .custom((endDate, { req }) => {
      if (req.query.fechaInicio && new Date(endDate) < new Date(req.query.fechaInicio)) {
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

// Rutas de Tránsito
router.post(
  '/vehiculo',
  auth,
  validate(validateVehicleCheck),
  transitoController.consultarVehiculo
);

router.post(
  '/infracciones',
  auth,
  validate(validateInfractionCheck),
  transitoController.consultarInfracciones
);

router.get(
  '/historial-propiedad/:placa',
  auth,
  validate([
    param('placa')
      .trim()
      .notEmpty()
      .withMessage('La placa es requerida')
      .custom(validatePlaca)
  ]),
  transitoController.consultarHistorialPropiedad
);

router.get(
  '/comparendos/:numero',
  auth,
  validate([
    param('numero')
      .trim()
      .notEmpty()
      .withMessage('El número de comparendo es requerido')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Número de comparendo inválido')
  ]),
  transitoController.consultarComparendo
);

router.get(
  '/historial',
  auth,
  validate(validateQueryParams),
  transitoController.consultarHistorialConsultas
);

export default router;
