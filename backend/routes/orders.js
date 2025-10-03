import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addNote,
  uploadAttachments,
  downloadAttachment,
  getOrderStatistics
} from '../controllers/orderController.js';
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

// Validación de ítems de la orden
const validateOrderItems = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un ítem')
    .custom(items => {
      return items.every((item, index) => {
        if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
          throw new Error(`El ítem en la posición ${index} debe tener una descripción`);
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
          throw new Error(`La cantidad del ítem "${item.description}" debe ser un número entero mayor a 0`);
        }
        if (typeof item.price !== 'number' || item.price < 0) {
          throw new Error(`El precio del ítem "${item.description}" debe ser un número positivo`);
        }
        return true;
      });
    })
];

// Validación de fechas
const validateDates = [
  body('scheduledDate')
    .isISO8601()
    .withMessage('Fecha programada inválida. Debe estar en formato ISO 8601')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (date < now) {
        throw new Error('La fecha programada no puede ser en el pasado');
      }
      return true;
    }),
  body('completionDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de finalización inválida')
    .custom((value, { req }) => {
      if (req.body.scheduledDate && new Date(value) < new Date(req.body.scheduledDate)) {
        throw new Error('La fecha de finalización no puede ser anterior a la fecha programada');
      }
      return true;
    })
];

// Validación de ID
const validateId = [
  param('id')
    .custom(validateObjectId)
    .withMessage('ID de orden no válido')
];

// Validación de notas
const validateNote = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El contenido de la nota es requerido')
    .isLength({ min: 5, max: 1000 })
    .withMessage('La nota debe tener entre 5 y 1000 caracteres'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('El campo isInternal debe ser un valor booleano')
];

// Validación de parámetros de consulta
const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'])
    .withMessage('Estado de orden no válido'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridad no válida'),
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
    })
];

// Rutas de órdenes
router.post(
  '/',
  auth,
  validate([
    body('client')
      .optional()
      .custom(validateObjectId)
      .withMessage('ID de cliente no válido'),
    body('technician')
      .optional()
      .custom(validateObjectId)
      .withMessage('ID de técnico no válido'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('La descripción es requerida')
      .isLength({ min: 10, max: 1000 })
      .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Prioridad no válida. Debe ser: low, medium o high'),
    ...validateOrderItems,
    ...validateDates
  ]),
  createOrder
);

router.get(
  '/',
  auth,
  validate(validateQueryParams),
  getOrders
);

router.get(
  '/statistics',
  auth,
  validate([
    query('groupBy')
      .optional()
      .isIn(['day', 'week', 'month', 'year', 'technician', 'status'])
      .withMessage('Criterio de agrupación no válido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin inválida')
  ]),
  getOrderStatistics
);

router.get(
  '/:id',
  auth,
  validate(validateId),
  getOrderById
);

router.put(
  '/:id',
  auth,
  validate(validateId),
  validate([
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'])
      .withMessage('Estado de orden no válido'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Prioridad no válida'),
    ...validateOrderItems.map(validation => validation.optional()),
    ...validateDates.map(validation => validation.optional())
  ]),
  updateOrder
);

router.delete(
  '/:id',
  auth,
  auth.isAdmin,
  validate(validateId),
  deleteOrder
);

router.post(
  '/:id/notes',
  auth,
  validate(validateId),
  validate(validateNote),
  addNote
);

router.post(
  '/:id/attachments',
  auth,
  validate(validateId),
  // El middleware de carga de archivos se manejará en el controlador
  uploadAttachments
);

router.get(
  '/:orderId/attachments/:attachmentId/download',
  auth,
  validate([
    param('orderId')
      .custom(validateObjectId)
      .withMessage('ID de orden no válido'),
    param('attachmentId')
      .custom(validateObjectId)
      .withMessage('ID de archivo adjunto no válido')
  ]),
  downloadAttachment
);

export default router;
