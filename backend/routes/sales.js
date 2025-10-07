import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as saleController from '../controllers/saleController.js';

const router = express.Router();

router.use(auth);

// GET stats
router.get('/stats', saleController.getSaleStats);

// GET by client
router.get('/client/:clientId', saleController.getSalesByClient);

// GET all sales
router.get('/', saleController.getSales);

// GET by ID
router.get('/:id', saleController.getSaleById);

// POST create
router.post('/',
  [
    body('client').notEmpty().withMessage('El cliente es requerido'),
    body('vehicle').notEmpty().withMessage('El vehículo es requerido'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Precio base inválido'),
    body('saleDate').optional().isISO8601().withMessage('Fecha de venta inválida'),
    body('paymentMethod').isIn(['cash', 'credit', 'financing', 'mixed', 'bank_transfer', 'check']).withMessage('Método de pago inválido')
  ],
  saleController.createSale
);

// PUT update
router.put('/:id', saleController.updateSale);

// DELETE soft delete
router.delete('/:id', saleController.deleteSale);

// PATCH confirm sale
router.patch('/:id/confirm', saleController.confirmSale);

// PATCH complete sale
router.patch('/:id/complete', saleController.completeSale);

// PATCH cancel sale
router.patch('/:id/cancel',
  [body('reason').notEmpty().withMessage('La razón de cancelación es requerida')],
  saleController.cancelSale
);

export default router;
