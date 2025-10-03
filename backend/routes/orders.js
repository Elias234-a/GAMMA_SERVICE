import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Middleware para validar datos de entrada
const validateOrder = [
  check('description', 'La descripción es requerida').not().isEmpty(),
  check('items', 'Debe incluir al menos un ítem').isArray({ min: 1 }),
  check('items.*.description', 'Descripción del ítem requerida').not().isEmpty(),
  check('items.*.quantity', 'Cantidad inválida').isInt({ min: 1 }),
  check('items.*.price', 'Precio inválido').isFloat({ min: 0 }),
  check('scheduledDate', 'Fecha programada inválida').isISO8601(),
  check('priority', 'Prioridad inválida').optional().isIn(['low', 'medium', 'high'])
];

// Rutas de órdenes
router.post('/', [auth, ...validateOrder], orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id', [auth, ...validateOrder], orderController.updateOrder);
router.delete('/:id', [auth, auth.isAdmin], orderController.deleteOrder);
router.post('/:id/notes', [
  auth,
  check('content', 'El contenido de la nota es requerido').not().isEmpty()
], orderController.addNote);

export default router;
