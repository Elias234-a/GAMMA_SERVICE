import mongoose from 'mongoose';
import Order from './Order.js';

const technicianSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido'],
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  specialty: {
    type: String,
    required: [true, 'La especialidad es requerida'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: [0, 'La experiencia no puede ser negativa'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    lastUpdated: Date
  },
  rating: {
    type: Number,
    min: [0, 'La calificación no puede ser menor a 0'],
    max: [5, 'La calificación no puede ser mayor a 5'],
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  documents: [{
    name: {
      type: String,
      required: [true, 'El nombre del documento es requerido']
    },
    url: {
      type: String,
      required: [true, 'La URL del documento es requerida']
    },
    type: {
      type: String,
      enum: ['id', 'license', 'certification', 'other'],
      required: [true, 'El tipo de documento es requerido']
    },
    expirationDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'on_leave', 'on_vacation'],
      message: 'Estado de técnico no válido'
    },
    default: 'active'
  },
  workSchedule: {
    monday: { start: String, end: String, available: Boolean },
    tuesday: { start: String, end: String, available: Boolean },
    wednesday: { start: String, end: String, available: Boolean },
    thursday: { start: String, end: String, available: Boolean },
    friday: { start: String, end: String, available: Boolean },
    saturday: { start: String, end: String, available: Boolean },
    sunday: { start: String, end: String, available: Boolean }
  },
  assignedOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  maxSimultaneousOrders: {
    type: Number,
    default: 3,
    min: 1
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice para búsquedas por ubicación
technicianSchema.index({ 'currentLocation': '2dsphere' });

// Middleware para actualizar la disponibilidad basada en el estado
technicianSchema.pre('save', function(next) {
  // Si el estado no es 'active', el técnico no está disponible
  if (this.status !== 'active') {
    this.isAvailable = false;
  }
  next();
});

/**
 * Verifica si el técnico está disponible para un nuevo trabajo
 * @param {Date} startDate - Fecha de inicio del trabajo
 * @param {Number} expectedDuration - Duración esperada en minutos
 * @returns {Promise<Boolean>} - True si está disponible, false en caso contrario
 */
technicianSchema.methods.isAvailableForJob = async function(startDate, expectedDuration) {
  if (!this.isAvailable || this.status !== 'active') {
    return false;
  }

  // Verificar si ha alcanzado el límite de órdenes simultáneas
  const currentOrders = await Order.countDocuments({
    technician: this._id,
    status: { $in: ['in_progress', 'pending'] }
  });

  if (currentOrders >= this.maxSimultaneousOrders) {
    return false;
  }

  // Verificar disponibilidad en el horario laboral
  const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const schedule = this.workSchedule[dayOfWeek];
  
  if (!schedule || !schedule.available) {
    return false;
  }

  // Aquí podrías agregar más lógica de verificación de disponibilidad
  // como verificar conflictos con otras órdenes programadas

  return true;
};

/**
 * Asigna una orden al técnico
 * @param {String} orderId - ID de la orden a asignar
 * @returns {Promise<Object>} - Técnico actualizado
 */
technicianSchema.methods.assignOrder = async function(orderId) {
  if (this.assignedOrders.includes(orderId)) {
    return this; // Ya está asignada esta orden
  }

  this.assignedOrders.push(orderId);
  
  // Si alcanza el límite de órdenes, marcar como no disponible
  if (this.assignedOrders.length >= this.maxSimultaneousOrders) {
    this.isAvailable = false;
  }

  return this.save();
};

/**
 * Libera una orden asignada al técnico
 * @param {String} orderId - ID de la orden a liberar
 * @returns {Promise<Object>} - Técnico actualizado
 */
technicianSchema.methods.releaseOrder = async function(orderId) {
  const orderIndex = this.assignedOrders.indexOf(orderId);
  
  if (orderIndex > -1) {
    this.assignedOrders.splice(orderIndex, 1);
    this.isAvailable = true; // Marcar como disponible
    return this.save();
  }
  
  return this;
};

/**
 * Actualiza la calificación del técnico
 * @param {Number} newRating - Nueva calificación (1-5)
 * @returns {Promise<Object>} - Técnico actualizado
 */
technicianSchema.methods.updateRating = async function(newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('La calificación debe estar entre 1 y 5');
  }

  const totalRatings = this.totalRatings + 1;
  const newAverage = ((this.rating * this.totalRatings) + newRating) / totalRatings;
  
  this.rating = parseFloat(newAverage.toFixed(1));
  this.totalRatings = totalRatings;
  
  return this.save();
};

/**
 * Obtiene las estadísticas del técnico
 * @returns {Object} - Estadísticas del técnico
 */
technicianSchema.methods.getStats = function() {
  return {
    completedJobs: this.completedJobs,
    rating: this.rating,
    totalRatings: this.totalRatings,
    availability: this.isAvailable ? 'Disponible' : 'No disponible',
    currentLoad: this.assignedOrders.length,
    maxLoad: this.maxSimultaneousOrders
  };
};

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician;
