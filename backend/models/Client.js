import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  // Información personal
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  
  // Identificación
  identificationType: {
    type: String,
    enum: ['CC', 'CE', 'NIT', 'TI', 'PAS', 'RUT'],
    required: [true, 'El tipo de identificación es requerido']
  },
  identificationNumber: {
    type: String,
    required: [true, 'El número de identificación es requerido'],
    unique: true,
    trim: true,
    index: true
  },

  // Información de contacto
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },

  // Dirección
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'La ciudad es requerida']
    },
    state: String,
    country: {
      type: String,
      default: 'Colombia'
    },
    postalCode: String
  },

  // Información adicional
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_say']
  },
  occupation: String,
  income: {
    type: Number,
    min: [0, 'El ingreso no puede ser negativo']
  },

  // Información crediticia
  creditScore: {
    type: Number,
    min: [0, 'Score crediticio inválido'],
    max: [1000, 'Score crediticio inválido']
  },
  creditStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'not_evaluated'],
    default: 'not_evaluated'
  },
  lastCreditCheck: Date,

  // Estado del cliente
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'prospect'],
    default: 'active'
  },
  
  // Categoría del cliente
  category: {
    type: String,
    enum: ['vip', 'regular', 'new', 'problematic'],
    default: 'new'
  },

  // Información comercial
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'whatsapp', 'sms'],
    default: 'email'
  },
  tags: [{
    type: String,
    trim: true
  }],

  // Historial
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, 'Total de compras inválido']
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total gastado inválido']
  },
  lastPurchaseDate: Date,
  
  // Referido
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },

  // Notas
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
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Usuario asociado (si tiene cuenta en el sistema)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
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

// Índices simples
clientSchema.index({ email: 1 });
clientSchema.index({ identificationNumber: 1 });
clientSchema.index({ isDeleted: 1 });

// Índices compuestos para queries comunes (OPTIMIZACIÓN)
clientSchema.index({ status: 1, category: 1 }); // Filtros combinados
clientSchema.index({ isDeleted: 1, status: 1 }); // Queries con ambos
clientSchema.index({ createdAt: -1 }); // Ordenamiento por fecha
clientSchema.index({ 'address.city': 1, status: 1 }); // Búsqueda por ciudad
clientSchema.index({ totalSpent: -1 }); // Top clientes por gasto
clientSchema.index({ lastPurchaseDate: -1 }); // Actividad reciente

// Índice de búsqueda de texto para búsquedas generales
clientSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text',
  phone: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 5,
    phone: 3
  },
  name: 'client_text_search'
});

// Virtual para nombre completo
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual para edad
clientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual para promedio de compra
clientSchema.virtual('averagePurchase').get(function() {
  if (this.totalPurchases === 0) return 0;
  return this.totalSpent / this.totalPurchases;
});

// Método para actualizar estadísticas de compra
clientSchema.methods.updatePurchaseStats = async function(purchaseAmount) {
  this.totalPurchases += 1;
  this.totalSpent += purchaseAmount;
  this.lastPurchaseDate = new Date();
  
  // Actualizar categoría basado en compras
  if (this.totalSpent > 100000000) { // > 100M
    this.category = 'vip';
  } else if (this.totalPurchases > 0) {
    this.category = 'regular';
  }
  
  await this.save();
  return this;
};

// Método para evaluar crédito
clientSchema.methods.evaluateCredit = async function(score, status) {
  this.creditScore = score;
  this.creditStatus = status;
  this.lastCreditCheck = new Date();
  await this.save();
  return this;
};

// Método para soft delete
clientSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.status = 'inactive';
  await this.save();
  return this;
};

// Método para bloquear cliente
clientSchema.methods.block = async function(reason, userId) {
  this.status = 'blocked';
  this.notes.push({
    content: `Cliente bloqueado. Razón: ${reason}`,
    createdBy: userId,
    isImportant: true
  });
  await this.save();
  return this;
};

// Método estático para buscar clientes activos
clientSchema.statics.findActive = function() {
  return this.find({ status: 'active', isDeleted: false });
};

// Método estático para buscar clientes VIP
clientSchema.statics.findVIP = function() {
  return this.find({ category: 'vip', status: 'active', isDeleted: false });
};

// Middleware para excluir eliminados por defecto
clientSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
