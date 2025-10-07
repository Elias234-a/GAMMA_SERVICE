import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  // Número de factura único
  invoiceNumber: {
    type: String,
    unique: true,
    required: [true, 'El número de factura es requerido'],
    index: true
  },

  // Referencias
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El cliente es requerido']
  },
  
  // Tipo de factura
  type: {
    type: String,
    enum: ['sale', 'service', 'adjustment', 'credit_note', 'debit_note'],
    default: 'sale'
  },

  // Fechas
  issueDate: {
    type: Date,
    required: [true, 'La fecha de emisión es requerida'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha de vencimiento es requerida']
  },

  // Items de la factura
  items: [{
    description: {
      type: String,
      required: [true, 'La descripción del ítem es requerida']
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [0, 'La cantidad no puede ser negativa']
    },
    unitPrice: {
      type: Number,
      required: [true, 'El precio unitario es requerido'],
      min: [0, 'El precio unitario no puede ser negativo']
    },
    taxRate: {
      type: Number,
      default: 19, // IVA Colombia
      min: [0, 'La tasa de impuesto no puede ser negativa']
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  }],

  // Montos
  subtotal: {
    type: Number,
    required: [true, 'El subtotal es requerido'],
    min: [0, 'El subtotal no puede ser negativo']
  },
  
  // Impuestos desglosados
  taxes: [{
    name: {
      type: String,
      required: true
    },
    rate: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  
  totalTaxes: {
    type: Number,
    default: 0,
    min: [0, 'Los impuestos totales no pueden ser negativos']
  },

  // Descuentos
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

  // Total
  totalAmount: {
    type: Number,
    required: [true, 'El monto total es requerido'],
    min: [0, 'El monto total no puede ser negativo']
  },

  // Estado de pago
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'transfer', 'check', 'financing', 'other']
  },

  // Pagos registrados
  payments: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'El monto del pago no puede ser negativo']
    },
    method: {
      type: String,
      required: true
    },
    reference: String,
    notes: String,
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'El monto pagado no puede ser negativo']
  },
  balanceDue: {
    type: Number,
    default: 0
  },

  // Información de la empresa (emisor)
  company: {
    name: String,
    taxId: String,
    address: String,
    city: String,
    phone: String,
    email: String
  },

  // Información del cliente (receptor)
  clientInfo: {
    name: String,
    taxId: String,
    address: String,
    city: String,
    phone: String,
    email: String
  },

  // Información DIAN (Facturación Electrónica)
  dianData: {
    isElectronic: {
      type: Boolean,
      default: false
    },
    cufe: String, // Código Único de Factura Electrónica
    qrCode: String,
    xmlUrl: String,
    pdfUrl: String,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date,
    approvedAt: Date,
    rejectionReason: String,
    responseData: mongoose.Schema.Types.Mixed
  },

  // Moneda
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR']
  },

  // Notas y términos
  notes: String,
  terms: String,
  internalNotes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Estado
  status: {
    type: String,
    enum: ['draft', 'issued', 'sent', 'cancelled', 'voided'],
    default: 'draft'
  },

  // Documentos relacionados
  relatedDocuments: [{
    type: String,
    docType: String,
    docNumber: String
  }],

  // Creación y modificación
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador es requerido']
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

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
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1, issueDate: -1 });
invoiceSchema.index({ sale: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ isDeleted: 1 });

// Generar número de factura antes de guardar
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calcular balanceDue
  this.balanceDue = this.totalAmount - this.amountPaid;
  
  // Actualizar estado de pago basado en balance
  if (this.amountPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
    if (!this.paymentDate) {
      this.paymentDate = new Date();
    }
  } else if (this.amountPaid > 0 && this.amountPaid < this.totalAmount) {
    this.paymentStatus = 'partial';
  }
  
  // Verificar si está vencida
  if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
    this.paymentStatus = 'overdue';
  }
  
  next();
});

// Virtual para días hasta vencimiento
invoiceSchema.virtual('daysUntilDue').get(function() {
  if (this.paymentStatus === 'paid') return 0;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
});

// Virtual para estado de vencimiento
invoiceSchema.virtual('overdueStatus').get(function() {
  if (this.paymentStatus === 'paid') return 'paid';
  const days = this.daysUntilDue;
  if (days < 0) return 'overdue';
  if (days <= 7) return 'due_soon';
  return 'current';
});

// Método para calcular totales
invoiceSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  let totalTaxes = 0;
  
  // Calcular por cada ítem
  this.items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = (itemSubtotal * item.taxRate) / 100;
    
    item.subtotal = itemSubtotal;
    item.taxAmount = itemTax;
    item.total = itemSubtotal + itemTax;
    
    subtotal += itemSubtotal;
    totalTaxes += itemTax;
  });
  
  this.subtotal = subtotal;
  this.totalTaxes = totalTaxes;
  
  // Aplicar descuento
  if (this.discountPercentage > 0) {
    this.discount = (this.subtotal * this.discountPercentage) / 100;
  }
  
  // Calcular total
  this.totalAmount = this.subtotal - this.discount + this.totalTaxes;
  this.balanceDue = this.totalAmount - this.amountPaid;
  
  return this;
};

// Método para registrar pago
invoiceSchema.methods.registerPayment = async function(amount, method, reference, userId, notes) {
  this.payments.push({
    date: new Date(),
    amount,
    method,
    reference,
    notes,
    registeredBy: userId
  });
  
  this.amountPaid += amount;
  
  if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
    this.paymentDate = new Date();
    this.paymentMethod = method;
  } else {
    this.paymentStatus = 'partial';
  }
  
  this.balanceDue = this.totalAmount - this.amountPaid;
  
  await this.save();
  return this;
};

// Método para emitir factura
invoiceSchema.methods.issue = async function(userId) {
  this.status = 'issued';
  this.modifiedBy = userId;
  
  this.internalNotes.push({
    content: 'Factura emitida',
    createdBy: userId
  });
  
  await this.save();
  return this;
};

// Método para cancelar factura
invoiceSchema.methods.cancel = async function(reason, userId) {
  this.status = 'cancelled';
  this.paymentStatus = 'cancelled';
  
  this.internalNotes.push({
    content: `Factura cancelada. Razón: ${reason}`,
    createdBy: userId
  });
  
  await this.save();
  return this;
};

// Método para soft delete
invoiceSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Método estático para facturas vencidas
invoiceSchema.statics.findOverdue = function() {
  return this.find({
    paymentStatus: { $nin: ['paid', 'cancelled'] },
    dueDate: { $lt: new Date() },
    isDeleted: false
  });
};

// Método estático para facturas del mes
invoiceSchema.statics.findByMonth = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.find({
    issueDate: { $gte: startDate, $lte: endDate },
    isDeleted: false
  });
};

// Middleware para excluir eliminados por defecto
invoiceSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
