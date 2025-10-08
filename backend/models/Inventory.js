import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  // Referencia al vehículo
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'El vehículo es requerido'],
    unique: true
  },

  // Ubicación física
  location: {
    type: String,
    required: [true, 'La ubicación es requerida'],
    enum: ['showroom', 'warehouse', 'service_area', 'external_lot', 'in_transit', 'sold'],
    default: 'warehouse'
  },
  specificLocation: {
    zone: String,
    row: String,
    position: String
  },

  // Cantidad (normalmente 1 para vehículos, pero útil para partes)
  quantity: {
    type: Number,
    default: 1,
    min: [0, 'La cantidad no puede ser negativa']
  },

  // Estado del inventario
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'reserved', 'in_transit', 'sold'],
    default: 'in_stock'
  },

  // Niveles de stock (para partes y accesorios)
  stockLevels: {
    minimum: {
      type: Number,
      default: 1,
      min: [0, 'El nivel mínimo no puede ser negativo']
    },
    maximum: {
      type: Number,
      default: 10,
      min: [0, 'El nivel máximo no puede ser negativo']
    },
    reorderPoint: {
      type: Number,
      default: 2,
      min: [0, 'El punto de reorden no puede ser negativo']
    },
    reorderQuantity: {
      type: Number,
      default: 5,
      min: [0, 'La cantidad de reorden no puede ser negativa']
    }
  },

  // Información de adquisición
  supplier: {
    name: String,
    contact: String,
    phone: String,
    email: String
  },
  purchasePrice: {
    type: Number,
    min: [0, 'El precio de compra no puede ser negativo']
  },
  purchaseDate: Date,
  purchaseOrderNumber: String,

  // Fechas importantes
  receivedDate: {
    type: Date,
    default: Date.now
  },
  lastRestockDate: Date,
  lastCheckDate: Date,
  expiryDate: Date, // Para productos con fecha de vencimiento

  // Condición
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor', 'damaged', 'for_parts'],
    default: 'new'
  },
  conditionNotes: String,

  // Historial de movimientos
  movements: [{
    type: {
      type: String,
      enum: ['entry', 'exit', 'transfer', 'adjustment', 'sale', 'return', 'loss', 'damage'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: Number,
    newQuantity: Number,
    location: {
      from: String,
      to: String
    },
    reason: String,
    reference: String, // Número de orden, venta, etc.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Auditoría física
  lastAudit: {
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expectedQuantity: Number,
    actualQuantity: Number,
    variance: Number,
    notes: String
  },

  // Reservas
  reservations: [{
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    quantity: Number,
    reservationDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'fulfilled', 'cancelled']
    },
    reference: String
  }],

  // Valorización
  valuation: {
    costPrice: Number,
    marketPrice: Number,
    depreciationRate: Number,
    currentValue: Number,
    lastValuationDate: Date
  },

  // Alertas
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'expiring_soon', 'expired', 'damaged', 'overstock', 'obsolete']
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Imágenes
  images: [{
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Notas
  notes: [{
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

// Índices simples
inventorySchema.index({ vehicle: 1 });
inventorySchema.index({ isDeleted: 1 });

// Índices compuestos para queries comunes (OPTIMIZACIÓN)
inventorySchema.index({ status: 1, location: 1 }); // Filtros combinados
inventorySchema.index({ isDeleted: 1, status: 1 }); // Queries frecuentes
inventorySchema.index({ location: 1, quantity: 1 }); // Stock por ubicación
inventorySchema.index({ createdAt: -1 }); // Ordenamiento por fecha
inventorySchema.index({ condition: 1, status: 1 }); // Condición y estado
inventorySchema.index({ 'stockLevels.reorderPoint': 1, quantity: 1 }); // Alertas de reorden

// Virtual para verificar si necesita reorden
inventorySchema.virtual('needsReorder').get(function() {
  return this.quantity <= this.stockLevels.reorderPoint;
});

// Virtual para verificar stock bajo
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.stockLevels.minimum;
});

// Virtual para cantidad disponible (excluyendo reservas)
inventorySchema.virtual('availableQuantity').get(function() {
  const reserved = this.reservations
    .filter(r => r.status === 'active')
    .reduce((sum, r) => sum + r.quantity, 0);
  return Math.max(0, this.quantity - reserved);
});

// Método para registrar entrada
inventorySchema.methods.registerEntry = async function(quantity, reason, userId, reference, notes) {
  const previousQuantity = this.quantity;
  this.quantity += quantity;
  
  this.movements.push({
    type: 'entry',
    quantity,
    previousQuantity,
    newQuantity: this.quantity,
    reason,
    reference,
    performedBy: userId,
    notes
  });
  
  // Actualizar estado
  if (this.quantity > this.stockLevels.minimum) {
    this.status = 'in_stock';
  }
  
  await this.save();
  return this;
};

// Método para registrar salida
inventorySchema.methods.registerExit = async function(quantity, reason, userId, reference, notes) {
  if (this.quantity < quantity) {
    throw new Error('Cantidad insuficiente en inventario');
  }
  
  const previousQuantity = this.quantity;
  this.quantity -= quantity;
  
  this.movements.push({
    type: 'exit',
    quantity: -quantity,
    previousQuantity,
    newQuantity: this.quantity,
    reason,
    reference,
    performedBy: userId,
    notes
  });
  
  // Actualizar estado
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.stockLevels.minimum) {
    this.status = 'low_stock';
    this.createAlert('low_stock', 'Stock bajo: se requiere reorden', 'warning');
  }
  
  await this.save();
  return this;
};

// Método para transferir ubicación
inventorySchema.methods.transfer = async function(fromLocation, toLocation, userId, notes) {
  this.movements.push({
    type: 'transfer',
    quantity: this.quantity,
    previousQuantity: this.quantity,
    newQuantity: this.quantity,
    location: {
      from: fromLocation,
      to: toLocation
    },
    performedBy: userId,
    notes
  });
  
  this.location = toLocation;
  
  await this.save();
  return this;
};

// Método para crear alerta
inventorySchema.methods.createAlert = function(type, message, severity) {
  // Verificar si ya existe una alerta activa del mismo tipo
  const existingAlert = this.alerts.find(a => a.type === type && a.isActive);
  if (!existingAlert) {
    this.alerts.push({
      type,
      message,
      severity
    });
  }
};

// Método para realizar auditoría
inventorySchema.methods.performAudit = async function(actualQuantity, userId, notes) {
  const variance = actualQuantity - this.quantity;
  
  this.lastAudit = {
    date: new Date(),
    performedBy: userId,
    expectedQuantity: this.quantity,
    actualQuantity,
    variance,
    notes
  };
  
  // Ajustar cantidad si hay diferencia
  if (variance !== 0) {
    this.movements.push({
      type: 'adjustment',
      quantity: variance,
      previousQuantity: this.quantity,
      newQuantity: actualQuantity,
      reason: 'Ajuste por auditoría',
      performedBy: userId,
      notes: `Variancia: ${variance}. ${notes || ''}`
    });
    
    this.quantity = actualQuantity;
  }
  
  this.lastCheckDate = new Date();
  
  await this.save();
  return this;
};

// Método para crear reserva
inventorySchema.methods.createReservation = async function(quantity, clientId, userId, expiryDays = 7, reference) {
  if (this.availableQuantity < quantity) {
    throw new Error('Cantidad insuficiente disponible para reservar');
  }
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  this.reservations.push({
    reservedBy: userId,
    reservedFor: clientId,
    quantity,
    reservationDate: new Date(),
    expiryDate,
    status: 'active',
    reference
  });
  
  if (this.availableQuantity === 0) {
    this.status = 'reserved';
  }
  
  await this.save();
  return this;
};

// Método para soft delete
inventorySchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Método estático para items que necesitan reorden
inventorySchema.statics.findNeedingReorder = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$stockLevels.reorderPoint'] },
    status: { $ne: 'sold' },
    isDeleted: false
  });
};

// Método estático para stock bajo
inventorySchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$stockLevels.minimum'] },
    status: { $ne: 'sold' },
    isDeleted: false
  });
};

// Middleware para excluir eliminados por defecto
inventorySchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
