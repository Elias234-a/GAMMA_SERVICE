import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  // Número de venta único
  saleNumber: {
    type: String,
    unique: true,
    index: true
  },

  // Referencias
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El cliente es requerido']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'El vehículo es requerido']
  },
  salesperson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El vendedor es requerido']
  },

  // Fechas
  saleDate: {
    type: Date,
    required: [true, 'La fecha de venta es requerida'],
    default: Date.now
  },
  deliveryDate: Date,
  expectedDeliveryDate: Date,

  // Precios y descuentos
  basePrice: {
    type: Number,
    required: [true, 'El precio base es requerido'],
    min: [0, 'El precio base no puede ser negativo']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de descuento no puede ser negativo'],
    max: [100, 'El porcentaje de descuento no puede ser mayor a 100']
  },
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Los impuestos no pueden ser negativos']
  },
  additionalFees: [{
    concept: String,
    amount: {
      type: Number,
      min: [0, 'El monto no puede ser negativo']
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio total no puede ser negativo']
  },

  // Método de pago
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'financing', 'mixed', 'bank_transfer', 'check'],
    required: [true, 'El método de pago es requerido']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Detalles de pago
  downPayment: {
    type: Number,
    default: 0,
    min: [0, 'La cuota inicial no puede ser negativa']
  },
  remainingBalance: {
    type: Number,
    default: 0,
    min: [0, 'El saldo pendiente no puede ser negativo']
  },
  
  // Información de financiamiento
  financingDetails: {
    isFinanced: {
      type: Boolean,
      default: false
    },
    financingEntity: String,
    loanAmount: Number,
    interestRate: Number,
    term: Number, // meses
    monthlyPayment: Number,
    approvalDate: Date,
    approvalNumber: String
  },

  // Estado de la venta
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_process', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Documentación
  contractGenerated: {
    type: Boolean,
    default: false
  },
  contractDate: Date,
  contractUrl: String,
  
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },

  // Extras y accesorios incluidos
  includedExtras: [{
    item: String,
    value: Number,
    description: String
  }],

  // Vehículo entregado en parte de pago
  tradeIn: {
    hasTradeIn: {
      type: Boolean,
      default: false
    },
    vehicle: {
      brand: String,
      model: String,
      year: Number,
      plate: String,
      vin: String
    },
    valuationAmount: Number,
    condition: String,
    notes: String
  },

  // Seguimiento
  deliveryStatus: {
    type: String,
    enum: ['pending', 'ready', 'delivered', 'delayed'],
    default: 'pending'
  },
  
  // Garantía
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: true
    },
    type: String,
    durationMonths: Number,
    startDate: Date,
    endDate: Date,
    provider: String
  },

  // Notas y comentarios
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Documentos adjuntos
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comisión del vendedor
  salesCommission: {
    percentage: Number,
    amount: Number,
    isPaid: {
      type: Boolean,
      default: false
    },
    paidDate: Date
  },

  // Cancelación/Reembolso
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  refundAmount: Number,
  refundDate: Date,

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ client: 1, saleDate: -1 });
saleSchema.index({ salesperson: 1, saleDate: -1 });
saleSchema.index({ vehicle: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ isDeleted: 1 });

// Generar número de venta antes de guardar
saleSchema.pre('save', async function(next) {
  if (!this.saleNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Sale').countDocuments();
    this.saleNumber = `VTA-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual para ganancia
saleSchema.virtual('profit').get(function() {
  // Necesita acceso al costo del vehículo (debe poblarse)
  if (this.vehicle && this.vehicle.cost) {
    return this.totalPrice - this.vehicle.cost;
  }
  return null;
});

// Virtual para porcentaje de descuento calculado
saleSchema.virtual('calculatedDiscountPercentage').get(function() {
  if (this.basePrice === 0) return 0;
  return ((this.discount / this.basePrice) * 100).toFixed(2);
});

// Método para calcular total
saleSchema.methods.calculateTotal = function() {
  let total = this.basePrice;
  
  // Aplicar descuento
  if (this.discountPercentage > 0) {
    this.discount = (this.basePrice * this.discountPercentage) / 100;
  }
  total -= this.discount;
  
  // Agregar impuestos
  total += this.taxes;
  
  // Agregar tarifas adicionales
  if (this.additionalFees && this.additionalFees.length > 0) {
    const feesTotal = this.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    total += feesTotal;
  }
  
  // Restar trade-in
  if (this.tradeIn && this.tradeIn.hasTradeIn && this.tradeIn.valuationAmount) {
    total -= this.tradeIn.valuationAmount;
  }
  
  this.totalPrice = Math.max(0, total);
  return this.totalPrice;
};

// Método para actualizar saldo pendiente
saleSchema.methods.updateBalance = function() {
  this.remainingBalance = Math.max(0, this.totalPrice - this.downPayment);
  return this.remainingBalance;
};

// Método para confirmar venta
saleSchema.methods.confirm = async function(userId) {
  this.status = 'confirmed';
  this.notes.push({
    content: 'Venta confirmada',
    createdBy: userId,
    isImportant: true
  });
  await this.save();
  return this;
};

// Método para completar venta
saleSchema.methods.complete = async function(userId) {
  this.status = 'completed';
  this.paymentStatus = 'completed';
  this.deliveryDate = new Date();
  this.deliveryStatus = 'delivered';
  
  this.notes.push({
    content: 'Venta completada y vehículo entregado',
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para cancelar venta
saleSchema.methods.cancel = async function(reason, userId) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  
  this.notes.push({
    content: `Venta cancelada. Razón: ${reason}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para soft delete
saleSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Método estático para ventas del mes
saleSchema.statics.findByMonth = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.find({
    saleDate: { $gte: startDate, $lte: endDate },
    isDeleted: false
  });
};

// Middleware para excluir eliminados por defecto
saleSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
