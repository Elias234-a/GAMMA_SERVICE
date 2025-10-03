import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es requerido']
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: [
      function() {
        return this.status !== 'pending';
      },
      'El técnico es requerido para órdenes en progreso o completadas'
    ]
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'cancelled'],
      message: 'Estado de orden no válido'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres']
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  items: [{
    description: {
      type: String,
      required: [true, 'La descripción del ítem es requerida']
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es requerida'],
      min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    total: {
      type: Number,
      default: function() {
        return this.quantity * this.price;
      }
    }
  }],
  scheduledDate: {
    type: Date,
    required: [true, 'La fecha programada es requerida'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La fecha programada debe ser futura'
    }
  },
  completionDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Es opcional
        return value >= this.createdAt;
      },
      message: 'La fecha de finalización debe ser posterior a la de creación'
    }
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
  }],
  attachments: [{
    url: String,
    name: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsquedas frecuentes
orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ technician: 1, status: 1 });
orderSchema.index({ scheduledDate: 1 });

// Middleware para actualizar la fecha de modificación
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular el total basado en los ítems
orderSchema.methods.calculateTotal = function() {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
  return this.total;
};

// Método para cambiar el estado de la orden
orderSchema.methods.updateStatus = async function(newStatus, userId) {
  const allowedTransitions = {
    pending: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!allowedTransitions[this.status].includes(newStatus)) {
    throw new Error(`Transición de estado no permitida: ${this.status} -> ${newStatus}`);
  }

  // Si se está asignando un técnico
  if (newStatus === 'in_progress' && !this.technician) {
    throw new Error('No se puede marcar como en progreso sin asignar un técnico');
  }

  // Si se completa la orden, establecer la fecha de finalización
  if (newStatus === 'completed') {
    this.completionDate = new Date();
  }

  this.status = newStatus;
  
  // Agregar nota del cambio de estado
  this.notes.push({
    content: `Estado cambiado a ${newStatus}`,
    createdBy: userId
  });

  await this.save();
  return this;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
