import Payment from '../models/Payment.js';
import Sale from '../models/Sale.js';
import logger from '../config/logger.js';
import Stripe from 'stripe';
import axios from 'axios';

// Inicializar clientes de pasarelas
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Servicio de Pagos
 * Integración con múltiples pasarelas
 */
class PaymentService {
  
  /**
   * STRIPE - Crear Payment Intent
   */
  async createStripePayment(saleId, clientId, amount, currency = 'usd') {
    try {
      if (!stripe) {
        throw new Error('Stripe no está configurado');
      }

      // Crear Payment Intent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: currency.toLowerCase(),
        metadata: {
          saleId: saleId.toString(),
          clientId: clientId.toString()
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Crear registro en DB
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: currency.toUpperCase(),
        paymentMethod: 'stripe',
        status: 'pending',
        externalId: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        description: `Pago de venta #${saleId}`
      });

      logger.info('Stripe payment created', {
        paymentId: payment._id,
        stripePaymentIntentId: paymentIntent.id
      });

      return {
        payment,
        clientSecret: paymentIntent.client_secret
      };

    } catch (error) {
      logger.error('Error creating Stripe payment:', error);
      throw error;
    }
  }

  /**
   * STRIPE - Confirmar pago
   */
  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
      
      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (paymentIntent.status === 'succeeded') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        payment.cardLast4 = paymentIntent.charges.data[0]?.payment_method_details?.card?.last4;
        payment.cardBrand = paymentIntent.charges.data[0]?.payment_method_details?.card?.brand;
        payment.fee = (paymentIntent.charges.data[0]?.balance_transaction?.fee || 0) / 100;
        
        await payment.save();
        
        // Actualizar estado de la venta
        await Sale.findByIdAndUpdate(payment.sale, { 
          paymentStatus: 'paid',
          status: 'completed'
        });

        logger.info('Stripe payment confirmed', { paymentId: payment._id });
      }

      return payment;

    } catch (error) {
      logger.error('Error confirming Stripe payment:', error);
      throw error;
    }
  }

  /**
   * MERCADO PAGO - Crear preferencia de pago
   */
  async createMercadoPagoPayment(saleId, clientId, amount, sale) {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      
      if (!accessToken) {
        throw new Error('MercadoPago no está configurado');
      }

      // Crear preferencia de pago
      const preference = {
        items: [
          {
            title: sale.description || `Venta de vehículo`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'COP'
          }
        ],
        payer: {
          email: sale.client?.email || 'cliente@ejemplo.com'
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhooks/mercadopago`,
        external_reference: saleId.toString(),
        metadata: {
          sale_id: saleId.toString(),
          client_id: clientId.toString()
        }
      };

      const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        preference,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear registro en DB
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: 'COP',
        paymentMethod: 'mercadopago',
        status: 'pending',
        externalId: response.data.id,
        mercadopagoPaymentId: response.data.id,
        description: `Pago de venta #${saleId}`
      });

      logger.info('MercadoPago payment created', {
        paymentId: payment._id,
        preferenceId: response.data.id
      });

      return {
        payment,
        initPoint: response.data.init_point,
        preferenceId: response.data.id
      };

    } catch (error) {
      logger.error('Error creating MercadoPago payment:', error);
      throw error;
    }
  }

  /**
   * PSE - Colombia
   */
  async createPSEPayment(saleId, clientId, amount, bankCode, userInfo) {
    try {
      // Implementación simplificada - necesita credenciales reales de PSE
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: 'COP',
        paymentMethod: 'pse',
        status: 'pending',
        bankName: bankCode,
        description: `Pago PSE - Venta #${saleId}`
      });

      logger.info('PSE payment created', {
        paymentId: payment._id,
        bankCode
      });

      // En producción, aquí se haría la llamada a la API de PSE
      return {
        payment,
        redirectUrl: `https://pse-gateway.com/pay/${payment._id}` // URL simulada
      };

    } catch (error) {
      logger.error('Error creating PSE payment:', error);
      throw error;
    }
  }

  /**
   * WOMPI - Colombia
   */
  async createWompiPayment(saleId, clientId, amount, sale) {
    try {
      const publicKey = process.env.WOMPI_PUBLIC_KEY;
      const privateKey = process.env.WOMPI_PRIVATE_KEY;

      if (!publicKey || !privateKey) {
        throw new Error('Wompi no está configurado');
      }

      // Crear transacción en Wompi
      const transaction = {
        amount_in_cents: Math.round(amount * 100),
        currency: 'COP',
        customer_email: sale.client?.email || 'cliente@ejemplo.com',
        payment_method: {
          type: 'CARD',
          installments: 1
        },
        reference: `SALE-${saleId}`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/result`
      };

      const response = await axios.post(
        'https://production.wompi.co/v1/transactions',
        transaction,
        {
          headers: {
            'Authorization': `Bearer ${privateKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear registro en DB
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: 'COP',
        paymentMethod: 'wompi',
        status: 'pending',
        externalId: response.data.data.id,
        wompiTransactionId: response.data.data.id,
        description: `Pago de venta #${saleId}`
      });

      logger.info('Wompi payment created', {
        paymentId: payment._id,
        transactionId: response.data.data.id
      });

      return {
        payment,
        transactionId: response.data.data.id,
        checkoutUrl: response.data.data.payment_link_url
      };

    } catch (error) {
      logger.error('Error creating Wompi payment:', error);
      throw error;
    }
  }

  /**
   * Pago en efectivo
   */
  async createCashPayment(saleId, clientId, amount, receivedBy) {
    try {
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: 'COP',
        paymentMethod: 'cash',
        status: 'completed',
        completedAt: new Date(),
        processedBy: receivedBy,
        description: `Pago en efectivo - Venta #${saleId}`
      });

      // Actualizar venta
      await Sale.findByIdAndUpdate(saleId, { 
        paymentStatus: 'paid',
        status: 'completed'
      });

      logger.info('Cash payment created', { paymentId: payment._id });

      return payment;

    } catch (error) {
      logger.error('Error creating cash payment:', error);
      throw error;
    }
  }

  /**
   * Transferencia bancaria
   */
  async createBankTransferPayment(saleId, clientId, amount, bankInfo) {
    try {
      const payment = await Payment.create({
        sale: saleId,
        client: clientId,
        amount,
        currency: 'COP',
        paymentMethod: 'transfer',
        status: 'pending',
        bankName: bankInfo.bankName,
        bankAccount: bankInfo.accountNumber,
        description: `Transferencia bancaria - Venta #${saleId}`,
        notes: `Referencia: ${bankInfo.reference || 'N/A'}`
      });

      logger.info('Bank transfer payment created', { paymentId: payment._id });

      return payment;

    } catch (error) {
      logger.error('Error creating bank transfer payment:', error);
      throw error;
    }
  }

  /**
   * Confirmar transferencia bancaria (manual)
   */
  async confirmBankTransfer(paymentId, confirmedBy) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.processedBy = confirmedBy;
      await payment.save();

      // Actualizar venta
      await Sale.findByIdAndUpdate(payment.sale, { 
        paymentStatus: 'paid',
        status: 'completed'
      });

      logger.info('Bank transfer confirmed', { paymentId });

      return payment;

    } catch (error) {
      logger.error('Error confirming bank transfer:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de un pago
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('sale')
        .populate('client', 'name email');

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      return payment;

    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Procesar reembolso
   */
  async processRefund(paymentId, amount, reason, processedBy) {
    try {
      const payment = await Payment.findById(paymentId);
      
      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Procesar según método de pago
      if (payment.paymentMethod === 'stripe' && stripe) {
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(amount * 100)
        });

        payment.refundAmount = amount;
        payment.refundReason = reason;
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        payment.processedBy = processedBy;
        payment.gatewayResponse = refund;
        await payment.save();

        logger.info('Stripe refund processed', { paymentId, refundId: refund.id });
      } else {
        // Para otros métodos, marcar manualmente
        await payment.processRefund(amount, reason);
        payment.processedBy = processedBy;
        await payment.save();
      }

      // Actualizar venta
      await Sale.findByIdAndUpdate(payment.sale, { 
        paymentStatus: 'refunded',
        status: 'cancelled'
      });

      return payment;

    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Obtener pagos de un cliente
   */
  async getClientPayments(clientId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      
      const query = { client: clientId };
      if (status) query.status = status;

      const payments = await Payment.find(query)
        .populate('sale')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      logger.error('Error getting client payments:', error);
      throw error;
    }
  }
}

export default new PaymentService();
