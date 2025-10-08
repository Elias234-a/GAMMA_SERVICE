import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Información básica
  brand: {
    type: String,
    required: [true, 'La marca es requerida'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'El modelo es requerido'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'El año es requerido'],
    min: [1900, 'Año inválido'],
    max: [new Date().getFullYear() + 1, 'Año inválido']
  },
  plate: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true, // Permite null pero debe ser único si existe
    index: true
  },
  vin: {
    type: String,
    required: [true, 'El VIN es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [17, 'VIN debe tener 17 caracteres'],
    maxlength: [17, 'VIN debe tener 17 caracteres']
  },
  color: {
    type: String,
    required: [true, 'El color es requerido'],
    trim: true
  },

  // Precio y costo
  price: {
    type: Number,
    required: [true, 'El precio de venta es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  cost: {
    type: Number,
    required: [true, 'El costo es requerido'],
    min: [0, 'El costo no puede ser negativo']
  },
  
  // Estado
  status: {
    type: String,
    enum: {
      values: ['available', 'sold', 'reserved', 'in_service', 'damaged'],
      message: 'Estado de vehículo no válido'
    },
    default: 'available'
  },

  // Categorización
  category: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback', 'convertible', 'motorcycle', 'other'],
    required: [true, 'La categoría es requerida']
  },
  type: {
    type: String,
    enum: ['new', 'used', 'certified'],
    required: [true, 'El tipo es requerido'],
    default: 'used'
  },

  // Características técnicas
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt', 'dual-clutch'],
    required: [true, 'El tipo de transmisión es requerido']
  },
  fuel: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'plugin-hybrid', 'gas'],
    required: [true, 'El tipo de combustible es requerido']
  },
  mileage: {
    type: Number,
    default: 0,
    min: [0, 'El kilometraje no puede ser negativo']
  },
  engineSize: {
    type: Number, // En litros
    min: [0, 'Tamaño de motor inválido']
  },
  doors: {
    type: Number,
    min: [2, 'Número de puertas inválido'],
    max: [5, 'Número de puertas inválido']
  },

  // Características adicionales
  features: [{
    type: String,
    trim: true
  }],

  // Imágenes
  images: [{
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Propietario actual (si está vendido)
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },

  // Ubicación
  location: {
    type: String,
    default: 'showroom',
    trim: true
  },

  // Información adicional
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
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

  // Información de adquisición
  purchaseDate: Date,
  purchasePrice: Number,
  supplier: {
    type: String,
    trim: true
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
vehicleSchema.index({ plate: 1 });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ isDeleted: 1 });

// Índices compuestos para queries comunes (OPTIMIZACIÓN)
vehicleSchema.index({ status: 1, category: 1, brand: 1 }); // Filtros combinados
vehicleSchema.index({ isDeleted: 1, status: 1 }); // Queries frecuentes
vehicleSchema.index({ brand: 1, model: 1, year: 1 }); // Búsqueda específica
vehicleSchema.index({ price: 1, status: 1 }); // Rango de precios disponibles
vehicleSchema.index({ year: -1, status: 1 }); // Vehículos recientes
vehicleSchema.index({ createdAt: -1 }); // Ordenamiento por fecha
vehicleSchema.index({ currentOwner: 1, status: 1 }); // Historial de cliente

// Índice de búsqueda de texto para búsquedas generales
vehicleSchema.index({ 
  brand: 'text', 
  model: 'text', 
  description: 'text',
  plate: 'text'
}, {
  weights: {
    brand: 10,
    model: 10,
    plate: 8,
    description: 3
  },
  name: 'vehicle_text_search'
});

// Virtual para nombre completo del vehículo
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} ${this.year}`;
});

// Virtual para margen de ganancia
vehicleSchema.virtual('profit').get(function() {
  return this.price - this.cost;
});

// Virtual para porcentaje de ganancia
vehicleSchema.virtual('profitPercentage').get(function() {
  if (this.cost === 0) return 0;
  return ((this.price - this.cost) / this.cost * 100).toFixed(2);
});

// Método para marcar como vendido
vehicleSchema.methods.markAsSold = async function(clientId) {
  this.status = 'sold';
  this.currentOwner = clientId;
  await this.save();
  return this;
};

// Método para marcar como disponible
vehicleSchema.methods.markAsAvailable = async function() {
  this.status = 'available';
  this.currentOwner = null;
  await this.save();
  return this;
};

// Método para soft delete
vehicleSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Método estático para buscar vehículos disponibles
vehicleSchema.statics.findAvailable = function() {
  return this.find({ status: 'available', isDeleted: false });
};

// Middleware para excluir eliminados por defecto
vehicleSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
