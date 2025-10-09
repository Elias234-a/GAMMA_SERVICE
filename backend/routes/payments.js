import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createPayment,
  getPayment,
  getPayments,
  confirmPayment,
  refundPayment,
  getClientPayments,
  getPaymentStats,
  stripeWebhook,
  mercadopagoWebhook,
  wompiWebhook
} from '../controllers/paymentsController.js';
import { strictRateLimit } from '../middleware/userRateLimiter.js';

const router = express.Router();

/**
 * Webhooks (sin autenticación)
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/webhooks/mercadopago', mercadopagoWebhook);
router.post('/webhooks/wompi', wompiWebhook);

/**
 * Rutas protegidas
 */
router.use(protect);

/**
 * @route   POST /api/payments/create
 * @desc    Crear un nuevo pago
 * @access  Private
 */
router.post('/create', strictRateLimit, createPayment);

/**
 * @route   GET /api/payments
 * @desc    Obtener lista de pagos
 * @query   page, limit, status, paymentMethod, clientId, startDate, endDate
 * @access  Private
 */
router.get('/', getPayments);

/**
 * @route   GET /api/payments/stats
 * @desc    Obtener estadísticas de pagos
 * @query   startDate, endDate
 * @access  Private (Admin)
 */
router.get('/stats', authorize('admin', 'manager'), getPaymentStats);

/**
 * @route   GET /api/payments/client/:clientId
 * @desc    Obtener pagos de un cliente
 * @access  Private
 */
router.get('/client/:clientId', getClientPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Obtener detalles de un pago
 * @access  Private
 */
router.get('/:id', getPayment);

/**
 * @route   POST /api/payments/:id/confirm
 * @desc    Confirmar un pago manualmente
 * @access  Private (Admin, Manager)
 */
router.post('/:id/confirm', authorize('admin', 'manager'), confirmPayment);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Procesar reembolso
 * @body    { amount, reason }
 * @access  Private (Admin only)
 */
router.post('/:id/refund', authorize('admin'), strictRateLimit, refundPayment);

export default router;
