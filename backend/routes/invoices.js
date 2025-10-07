import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.use(auth);

// GET stats
router.get('/stats', invoiceController.getInvoiceStats);

// GET overdue
router.get('/overdue', invoiceController.getOverdueInvoices);

// GET all invoices
router.get('/', invoiceController.getInvoices);

// GET by ID
router.get('/:id', invoiceController.getInvoiceById);

// POST create
router.post('/',
  [
    body('client').notEmpty().withMessage('El cliente es requerido'),
    body('issueDate').optional().isISO8601().withMessage('Fecha de emisión inválida'),
    body('dueDate').isISO8601().withMessage('Fecha de vencimiento requerida'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem')
  ],
  invoiceController.createInvoice
);

// PUT update
router.put('/:id', invoiceController.updateInvoice);

// DELETE soft delete
router.delete('/:id', invoiceController.deleteInvoice);

// PATCH issue invoice
router.patch('/:id/issue', invoiceController.issueInvoice);

// POST register payment
router.post('/:id/payments',
  [
    body('amount').isFloat({ min: 0 }).withMessage('Monto inválido'),
    body('method').notEmpty().withMessage('Método de pago requerido')
  ],
  invoiceController.registerPayment
);

// PATCH cancel invoice
router.patch('/:id/cancel',
  [body('reason').notEmpty().withMessage('Razón de cancelación requerida')],
  invoiceController.cancelInvoice
);

// POST send by email
router.post('/:id/send', invoiceController.sendInvoiceByEmail);

export default router;
