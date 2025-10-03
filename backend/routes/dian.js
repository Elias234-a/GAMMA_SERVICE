import { Router } from 'express';
import * as dianController from '../controllers/dianController.js';
import { auth } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Middleware para validar datos de factura
const validateInvoice = [
  check('orderId', 'El ID de la orden es requerido').not().isEmpty(),
  check('customer', 'Datos del cliente son requeridos').isObject(),
  check('customer.identification', 'Identificación del cliente es requerida').not().isEmpty(),
  check('customer.name', 'Nombre del cliente es requerido').not().isEmpty(),
  check('items', 'Debe incluir al menos un ítem').isArray({ min: 1 }),
  check('items.*.description', 'Descripción del ítem es requerida').not().isEmpty(),
  check('items.*.quantity', 'Cantidad inválida').isInt({ min: 1 }),
  check('items.*.price', 'Precio inválido').isFloat({ min: 0 })
];

// Rutas de facturación electrónica DIAN
router.post('/invoices', [auth, ...validateInvoice], dianController.createInvoice);
router.get('/invoices', auth, dianController.getInvoices);
router.get('/invoices/:id', auth, dianController.getInvoiceStatus);
router.get('/invoices/:id/pdf', auth, dianController.downloadPdf);
router.post('/invoices/:id/void', [
  auth,
  check('reason', 'La razón de la anulación es requerida').not().isEmpty()
], dianController.voidInvoice);

export default router;
