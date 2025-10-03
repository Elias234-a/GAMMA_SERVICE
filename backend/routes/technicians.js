import { Router } from 'express';
import * as technicianController from '../controllers/technicianController.js';
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

const validateTechnician = [
  body('user')
    .notEmpty()
    .withMessage('El ID de usuario es requerido')
    .custom(validateObjectId)
    .withMessage('ID de usuario no válido'),
  body('specialty')
    .trim()
    .notEmpty()
    .withMessage('La especialidad es requerida')
    .isLength({ min: 2, max: 50 })
    .withMessage('La especialidad debe tener entre 2 y 50 caracteres'),
  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Las habilidades deben ser un arreglo')
    .custom(skills => skills.every(skill => typeof skill === 'string' && skill.length > 0))
    .withMessage('Cada habilidad debe ser un texto no vacío'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 60 })
    .withMessage('La experiencia debe ser un número entero entre 0 y 60 años'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'on_vacation'])
    .withMessage('Estado no válido. Debe ser: active, inactive, on_leave o on_vacation'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La tarifa por hora debe ser un número positivo'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Disponibilidad debe ser un valor booleano')
];

// Validación de coordenadas
const validateCoordinates = [
  body('coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Debe proporcionar un arreglo con exactamente 2 coordenadas [longitud, latitud]')
    .custom(([lng, lat]) => {
      return !isNaN(lng) && !isNaN(lat) && 
             lng >= -180 && lng <= 180 && 
             lat >= -90 && lat <= 90;
    })
    .withMessage('Coordenadas inválidas. La longitud debe estar entre -180 y 180, y la latitud entre -90 y 90')
];

// Validación de ID
const validateId = [
  param('id')
    .custom(validateObjectId)
    .withMessage('ID de técnico no válido')
];

// Rutas de técnicos
router.post(
  '/',
  [auth, validate(validateTechnician)],
  technicianController.createTechnician
);

router.get(
  '/',
  auth,
  validate([
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'on_leave', 'on_vacation', 'all'])
      .withMessage('Estado de filtro no válido'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El número de página debe ser un entero positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100')
  ]),
  technicianController.getTechnicians
);

router.get(
  '/nearby',
  auth,
  validate([
    query('lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida. Debe estar entre -90 y 90'),
    query('lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida. Debe estar entre -180 y 180'),
    query('maxDistance')
      .optional()
      .isInt({ min: 100, max: 10000 })
      .withMessage('La distancia máxima debe estar entre 100 y 10000 metros')
  ]),
  technicianController.findNearbyTechnicians
);

router.get(
  '/:id',
  auth,
  validate(validateId),
  technicianController.getTechnicianById
);

router.put(
  '/:id',
  auth,
  validate(validateId),
  validate(validateTechnician),
  technicianController.updateTechnician
);

router.put(
  '/:id/location',
  auth,
  validate(validateId),
  validate(validateCoordinates),
  technicianController.updateLocation
);

router.get(
  '/:id/stats',
  auth,
  validate(validateId),
  technicianController.getTechnicianStats
);

export default router;
