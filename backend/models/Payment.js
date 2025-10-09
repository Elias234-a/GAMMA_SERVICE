import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Referencia a la venta
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
    index: true
  },
  
  // Cliente
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  
  // Monto
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR', 'MXN']
  },
  
  // Método de pago
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'mercadopago', 'pse', 'wompi', 'cash', 'transfer', 'credit_card'],
    index: true
  },
  
  // Estado del pago
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // IDs externos de las pasarelas
  externalId: {
    type: String, // ID de Stripe, MercadoPago, etc.
    index: true,
    sparse: true
  },
  
  stripePaymentIntentId: String,
  mercadopagoPaymentId: String,
  pseTransactionId: String,
  wompiTransactionId: String,
  
  // Detalles del pago
  description: String,
  
  // Información de la tarjeta (últimos 4 dígitos)
  cardLast4: String,
  cardBrand: String,
  
  // Información bancaria (para PSE/transferencias)
  bankName: String,
  bankAccount: String,
  
  // Cuotas (para financiación)
  installments: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Comisiones
  fee: {
    type: Number,
    default: 0
  },
  
  netAmount: {
    type: Number // Monto neto después de comisiones
  },
  
  // Metadata adicional de la pasarela
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Fechas importantes
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Razón de fallo o cancelación
  failureReason: String,
  cancelReason: String,
  
  // Reembolsos
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  
  // IP y metadata del cliente
  ipAddress: String,
  userAgent: String,
  
  // Notas internas
  notes: String,
  
  // Usuario que procesó el pago
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices compuestos
paymentSchema.index({ sale: 1, status: 1 });
paymentSchema.index({ client: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });
paymentSchema.index({ externalId: 1, paymentMethod: 1 });

// Calcular monto neto antes de guardar
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('fee')) {
    this.netAmount = this.amount - (this.fee || 0);
  }
  next();
});

// Método para marcar como completado
paymentSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

// Método para marcar como fallido
paymentSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  await this.save();
};

// Método para procesar reembolso
paymentSchema.methods.processRefund = async function(amount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Solo se pueden reembolsar pagos completados');
  }
  
  if (amount > this.amount) {
    throw new Error('El monto del reembolso no puede ser mayor al monto del pago');
  }
  
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundAmount = amount;
  this.refundReason = reason;
  await this.save();
};

// Método estático para obtener estadísticas
paymentSchema.statics.getStats = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fee' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
