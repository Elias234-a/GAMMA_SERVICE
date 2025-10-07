import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Número de servicio único
  serviceNumber: {
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
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tipo de servicio
  serviceType: {
    type: String,
    enum: ['maintenance', 'repair', 'inspection', 'diagnostic', 'bodywork', 'painting', 'detailing', 'warranty', 'recall', 'other'],
    required: [true, 'El tipo de servicio es requerido']
  },

  // Categoría
  category: {
    type: String,
    enum: ['preventive', 'corrective', 'emergency', 'scheduled'],
    default: 'scheduled'
  },

  // Descripción
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  customerComplaint: String, // Queja/síntoma del cliente
  diagnosis: String, // Diagnóstico del técnico
  workPerformed: String, // Trabajo realizado

  // Fechas
  scheduledDate: {
    type: Date,
    required: [true, 'La fecha programada es requerida']
  },
  startDate: Date,
  completedDate: Date,
  estimatedCompletionDate: Date,

  // Estado
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'waiting_parts', 'waiting_approval', 'completed', 'cancelled', 'on_hold'],
    default: 'scheduled'
  },

  // Prioridad
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Kilometraje del vehículo
  mileage: {
    type: Number,
    min: [0, 'El kilometraje no puede ser negativo']
  },

  // Repuestos/Partes utilizadas
  parts: [{
    partNumber: String,
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'El precio no puede ser negativo']
    },
    total: {
      type: Number,
      default: 0
    },
    supplier: String,
    warranty: {
      hasWarranty: Boolean,
      durationMonths: Number
    }
  }],

  // Mano de obra
  labor: [{
    description: String,
    hours: {
      type: Number,
      min: [0, 'Las horas no pueden ser negativas']
    },
    hourlyRate: {
      type: Number,
      min: [0, 'La tarifa no puede ser negativa']
    },
    total: {
      type: Number,
      default: 0
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician'
    }
  }],

  // Costos
  partsCost: {
    type: Number,
    default: 0,
    min: [0, 'El costo de partes no puede ser negativo']
  },
  laborCost: {
    type: Number,
    default: 0,
    min: [0, 'El costo de mano de obra no puede ser negativo']
  },
  additionalCharges: [{
    concept: String,
    amount: {
      type: Number,
      min: [0, 'El monto no puede ser negativo']
    }
  }],
  discount: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo']
  },
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Los impuestos no pueden ser negativos']
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'El costo total no puede ser negativo']
  },

  // Estimado vs Real
  estimatedCost: {
    type: Number,
    min: [0, 'El costo estimado no puede ser negativo']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Las horas estimadas no pueden ser negativas']
  },
  actualHours: {
    type: Number,
    min: [0, 'Las horas reales no pueden ser negativas']
  },

  // Aprobación del cliente
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required'
  },
  approvedBy: String,
  approvedAt: Date,
  rejectionReason: String,

  // Pago
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'invoiced'],
    default: 'pending'
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },

  // Garantía
  isWarrantyWork: {
    type: Boolean,
    default: false
  },
  warrantyClaimNumber: String,

  // Inspección/Checklist
  inspection: {
    performed: {
      type: Boolean,
      default: false
    },
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [{
      item: String,
      status: {
        type: String,
        enum: ['ok', 'attention', 'urgent', 'replaced']
      },
      notes: String
    }],
    recommendations: String
  },

  // Calidad
  qualityCheck: {
    performed: {
      type: Boolean,
      default: false
    },
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    passed: Boolean,
    issues: String
  },

  // Satisfacción del cliente
  customerFeedback: {
    rating: {
      type: Number,
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5']
    },
    comments: String,
    receivedAt: Date
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

  // Imágenes (antes/después)
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['before', 'during', 'after', 'damage', 'other']
    },
    description: String,
    uploadedAt: {
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

  // Seguimiento
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,

  // Recordatorio de próximo servicio
  nextServiceDue: {
    date: Date,
    mileage: Number,
    description: String
  },

  // Creación y modificación
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador es requerido']
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
serviceSchema.index({ serviceNumber: 1 });
serviceSchema.index({ client: 1, scheduledDate: -1 });
serviceSchema.index({ vehicle: 1, scheduledDate: -1 });
serviceSchema.index({ technician: 1, status: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ scheduledDate: 1 });
serviceSchema.index({ paymentStatus: 1 });
serviceSchema.index({ isDeleted: 1 });

// Generar número de servicio antes de guardar
serviceSchema.pre('save', async function(next) {
  if (!this.serviceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Service').countDocuments();
    this.serviceNumber = `SRV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual para duración del servicio
serviceSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.completedDate) return null;
  const diff = this.completedDate - this.startDate;
  return Math.ceil(diff / (1000 * 60 * 60)); // horas
});

// Virtual para comparar estimado vs real
serviceSchema.virtual('costVariance').get(function() {
  if (!this.estimatedCost) return null;
  return this.totalCost - this.estimatedCost;
});

// Método para calcular costos totales
serviceSchema.methods.calculateCosts = function() {
  // Calcular costo de partes
  this.partsCost = this.parts.reduce((sum, part) => {
    part.total = part.quantity * part.unitPrice;
    return sum + part.total;
  }, 0);
  
  // Calcular costo de mano de obra
  this.laborCost = this.labor.reduce((sum, labor) => {
    labor.total = labor.hours * labor.hourlyRate;
    return sum + labor.total;
  }, 0);
  
  // Calcular cargos adicionales
  const additionalTotal = this.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  // Calcular total
  this.totalCost = this.partsCost + this.laborCost + additionalTotal + this.taxes - this.discount;
  
  return this;
};

// Método para iniciar servicio
serviceSchema.methods.start = async function(technicianId, userId) {
  this.status = 'in_progress';
  this.startDate = new Date();
  if (technicianId) {
    this.technician = technicianId;
  }
  
  this.notes.push({
    content: 'Servicio iniciado',
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para completar servicio
serviceSchema.methods.complete = async function(userId) {
  this.status = 'completed';
  this.completedDate = new Date();
  
  // Calcular horas reales si no está definido
  if (!this.actualHours && this.startDate) {
    const duration = (this.completedDate - this.startDate) / (1000 * 60 * 60);
    this.actualHours = Math.ceil(duration);
  }
  
  this.notes.push({
    content: 'Servicio completado',
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para cancelar servicio
serviceSchema.methods.cancel = async function(reason, userId) {
  this.status = 'cancelled';
  
  this.notes.push({
    content: `Servicio cancelado. Razón: ${reason}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para solicitar aprobación
serviceSchema.methods.requestApproval = async function(estimatedCost, userId) {
  this.requiresApproval = true;
  this.approvalStatus = 'pending';
  this.estimatedCost = estimatedCost;
  this.status = 'waiting_approval';
  
  this.notes.push({
    content: `Aprobación solicitada. Costo estimado: $${estimatedCost}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

// Método para aprobar servicio
serviceSchema.methods.approve = async function(approvedBy) {
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.status = 'in_progress';
  
  await this.save();
  return this;
};

// Método para soft delete
serviceSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Método estático para servicios pendientes
serviceSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['scheduled', 'waiting_parts', 'waiting_approval'] },
    isDeleted: false
  });
};

// Método estático para servicios en progreso
serviceSchema.statics.findInProgress = function() {
  return this.find({
    status: 'in_progress',
    isDeleted: false
  });
};

// Middleware para excluir eliminados por defecto
serviceSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
