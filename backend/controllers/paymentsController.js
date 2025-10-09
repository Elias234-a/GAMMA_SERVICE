import paymentService from '../services/paymentService.js';
import Payment from '../models/Payment.js';
import Sale from '../models/Sale.js';
import logger from '../config/logger.js';
import { auditMiddleware } from '../middleware/auditLogger.js';

/**
 * POST /api/payments/create
 * Crear un nuevo pago
 */
export const createPayment = async (req, res) => {
  try {
    const { saleId, paymentMethod, amount, ...paymentData } = req.body;

    // Verificar que la venta existe
    const sale = await Sale.findById(saleId).populate('client');
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    let result;

    // Procesar según método de pago
    switch (paymentMethod) {
      case 'stripe':
        result = await paymentService.createStripePayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          paymentData.currency || 'usd'
        );
        break;

      case 'mercadopago':
        result = await paymentService.createMercadoPagoPayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          sale
        );
        break;

      case 'pse':
        result = await paymentService.createPSEPayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          paymentData.bankCode,
          paymentData.userInfo
        );
        break;

      case 'wompi':
        result = await paymentService.createWompiPayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          sale
        );
        break;

      case 'cash':
        result = await paymentService.createCashPayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          req.user._id
        );
        break;

      case 'transfer':
        result = await paymentService.createBankTransferPayment(
          saleId,
          sale.client._id,
          amount || sale.totalAmount,
          paymentData.bankInfo
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Método de pago no soportado'
        });
    }

    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: result
    });

  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando el pago',
      error: error.message
    });
  }
};

/**
 * GET /api/payments/:id
 * Obtener detalles de un pago
 */
export const getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.id);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    logger.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo el pago'
    });
  }
};

/**
 * GET /api/payments
 * Obtener lista de pagos
 */
export const getPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentMethod, 
      clientId,
      startDate,
      endDate 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (clientId) query.client = clientId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('sale')
      .populate('client', 'name email document')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo los pagos'
    });
  }
};

/**
 * POST /api/payments/:id/confirm
 * Confirmar un pago (para transferencias bancarias)
 */
export const confirmPayment = async (req, res) => {
  try {
    const payment = await paymentService.confirmBankTransfer(
      req.params.id,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: payment
    });

  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando el pago',
      error: error.message
    });
  }
};

/**
 * POST /api/payments/:id/refund
 * Procesar reembolso
 */
export const refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Monto y razón son requeridos'
      });
    }

    const payment = await paymentService.processRefund(
      req.params.id,
      amount,
      reason,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: payment
    });

  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el reembolso',
      error: error.message
    });
  }
};

/**
 * GET /api/payments/client/:clientId
 * Obtener pagos de un cliente
 */
export const getClientPayments = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    const result = await paymentService.getClientPayments(
      req.params.clientId,
      { page, limit, status }
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error getting client payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo los pagos del cliente'
    });
  }
};

/**
 * GET /api/payments/stats
 * Obtener estadísticas de pagos
 */
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await Payment.getStats(start, end);

    // Estadísticas adicionales
    const totalPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const completedPayments = await Payment.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    const totalAmount = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          totalFees: { $sum: '$fee' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: {
          start,
          end
        },
        summary: {
          totalPayments,
          completedPayments,
          completionRate: totalPayments > 0 ? (completedPayments / totalPayments * 100).toFixed(2) : 0,
          totalAmount: totalAmount[0]?.total || 0,
          totalFees: totalAmount[0]?.totalFees || 0,
          netAmount: (totalAmount[0]?.total || 0) - (totalAmount[0]?.totalFees || 0)
        },
        byMethod: stats
      }
    });

  } catch (error) {
    logger.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

/**
 * POST /api/payments/webhooks/stripe
 * Webhook de Stripe
 */
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verificar webhook (requiere Stripe SDK)
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Procesar evento
    const event = req.body;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await paymentService.confirmStripePayment(event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        const payment = await Payment.findOne({ 
          stripePaymentIntentId: event.data.object.id 
        });
        if (payment) {
          await payment.markAsFailed(event.data.object.last_payment_error?.message);
        }
        break;
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/payments/webhooks/mercadopago
 * Webhook de MercadoPago
 */
export const mercadopagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener detalles del pago de MercadoPago
      // const paymentInfo = await mercadopago.payment.get(paymentId);
      
      // Actualizar en nuestra DB
      const payment = await Payment.findOne({ 
        mercadopagoPaymentId: paymentId 
      });

      if (payment) {
        // Actualizar según status
        // payment.status = mapMercadoPagoStatus(paymentInfo.status);
        // await payment.save();
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Error processing MercadoPago webhook:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/payments/webhooks/wompi
 * Webhook de Wompi
 */
export const wompiWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'transaction.updated') {
      const payment = await Payment.findOne({ 
        wompiTransactionId: data.transaction.id 
      });

      if (payment) {
        if (data.transaction.status === 'APPROVED') {
          await payment.markAsCompleted();
          await Sale.findByIdAndUpdate(payment.sale, { 
            paymentStatus: 'paid',
            status: 'completed'
          });
        } else if (data.transaction.status === 'DECLINED') {
          await payment.markAsFailed(data.transaction.status_message);
        }
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Error processing Wompi webhook:', error);
    res.status(400).json({ error: error.message });
  }
};

export default {
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
};
