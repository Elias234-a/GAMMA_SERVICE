import mongoose from 'mongoose';

const plateRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    index: true
  },
  
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
  
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  },
  
  requestType: {
    type: String,
    enum: ['new_vehicle', 'transfer', 'replacement', 'duplicate', 'color_change', 'other'],
    required: [true, 'El tipo de trámite es requerido']
  },
  
  requestDate: {
    type: Date,
    required: [true, 'La fecha de solicitud es requerida'],
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['pending', 'documents_review', 'submitted_transito', 'in_process', 'ready', 'delivered', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  
  previousPlate: String,
  newPlate: String,
  
  transitOffice: {
    name: String,
    city: String,
    code: String
  },
  
  vehicleDetails: {
    vin: String,
    brand: String,
    model: String,
    year: Number,
    color: String,
    engineNumber: String,
    bodyStyle: String,
    serviceType: {
      type: String,
      enum: ['particular', 'public', 'official', 'diplomatic', 'commercial']
    }
  },
  
  ownerInfo: {
    name: String,
    identificationType: String,
    identificationNumber: String,
    address: String,
    city: String,
    phone: String,
    email: String
  },
  
  previousOwner: {
    name: String,
    identificationType: String,
    identificationNumber: String
  },
  
  requiredDocuments: [{
    name: String,
    type: {
      type: String,
      enum: ['id_copy', 'sale_certificate', 'soat', 'technical_review', 'customs_declaration', 'invoice', 'power_of_attorney', 'other']
    },
    required: {
      type: Boolean,
      default: true
    },
    submitted: {
      type: Boolean,
      default: false
    },
    url: String,
    submittedDate: Date,
    approved: {
      type: Boolean,
      default: false
    }
  }],
  
  fees: {
    plateIssuance: {
      type: Number,
      default: 0
    },
    registration: {
      type: Number,
      default: 0
    },
    transfer: {
      type: Number,
      default: 0
    },
    inspection: {
      type: Number,
      default: 0
    },
    administrative: {
      type: Number,
      default: 0
    },
    other: [{
      concept: String,
      amount: Number
    }],
    total: {
      type: Number,
      default: 0
    }
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  
  paymentDate: Date,
  paymentReference: String,
  
  transitData: {
    submissionDate: Date,
    referenceNumber: String,
    trackingNumber: String,
    appointmentDate: Date,
    inspectionDate: Date,
    inspectionResult: {
      type: String,
      enum: ['approved', 'rejected', 'pending']
    },
    rejectionReason: String,
    completionDate: Date
  },
  
  soat: {
    company: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    amount: Number
  },
  
  technicalReview: {
    company: String,
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    result: {
      type: String,
      enum: ['approved', 'conditional', 'rejected']
    }
  },
  
  deliveryInfo: {
    deliveryDate: Date,
    deliveredTo: String,
    receivedBy: String,
    signature: String,
    idVerified: {
      type: Boolean,
      default: false
    }
  },
  
  comments: [{
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
  
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  expectedCompletionDate: Date,
  actualCompletionDate: Date,
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  cancellationReason: String,
  
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

plateRequestSchema.index({ requestNumber: 1 });
plateRequestSchema.index({ client: 1 });
plateRequestSchema.index({ vehicle: 1 });
plateRequestSchema.index({ status: 1 });
plateRequestSchema.index({ requestDate: -1 });

plateRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('PlateRequest').countDocuments();
    this.requestNumber = `PLT-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

plateRequestSchema.virtual('isOverdue').get(function() {
  if (this.status === 'delivered' || this.status === 'cancelled') return false;
  if (!this.expectedCompletionDate) return false;
  return new Date() > this.expectedCompletionDate;
});

plateRequestSchema.virtual('daysInProcess').get(function() {
  const endDate = this.actualCompletionDate || new Date();
  const diff = endDate - this.requestDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

plateRequestSchema.methods.calculateTotalFees = function() {
  let total = this.fees.plateIssuance + 
              this.fees.registration + 
              this.fees.transfer + 
              this.fees.inspection + 
              this.fees.administrative;
  
  if (this.fees.other && this.fees.other.length > 0) {
    total += this.fees.other.reduce((sum, fee) => sum + fee.amount, 0);
  }
  
  this.fees.total = total;
  return total;
};

plateRequestSchema.methods.submitToTransito = async function(referenceNumber, userId) {
  this.status = 'submitted_transito';
  this.transitData.submissionDate = new Date();
  this.transitData.referenceNumber = referenceNumber;
  
  this.timeline.push({
    status: 'submitted_transito',
    notes: `Trámite enviado a tránsito. Referencia: ${referenceNumber}`,
    updatedBy: userId
  });
  
  this.comments.push({
    content: `Trámite enviado a tránsito con referencia ${referenceNumber}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

plateRequestSchema.methods.markAsReady = async function(plateNumber, userId) {
  this.status = 'ready';
  this.newPlate = plateNumber;
  this.transitData.completionDate = new Date();
  this.actualCompletionDate = new Date();
  
  this.timeline.push({
    status: 'ready',
    notes: `Placa lista para entrega: ${plateNumber}`,
    updatedBy: userId
  });
  
  this.comments.push({
    content: `Placa ${plateNumber} lista para entrega`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

plateRequestSchema.methods.deliver = async function(deliveredTo, receivedBy, userId) {
  this.status = 'delivered';
  this.deliveryInfo.deliveryDate = new Date();
  this.deliveryInfo.deliveredTo = deliveredTo;
  this.deliveryInfo.receivedBy = receivedBy;
  
  this.timeline.push({
    status: 'delivered',
    notes: `Placa entregada a ${receivedBy}`,
    updatedBy: userId
  });
  
  this.comments.push({
    content: `Placa entregada exitosamente a ${receivedBy}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

plateRequestSchema.methods.cancel = async function(reason, userId) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  
  this.timeline.push({
    status: 'cancelled',
    notes: `Trámite cancelado: ${reason}`,
    updatedBy: userId
  });
  
  this.comments.push({
    content: `Trámite cancelado. Razón: ${reason}`,
    createdBy: userId,
    isImportant: true
  });
  
  await this.save();
  return this;
};

plateRequestSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

plateRequestSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['pending', 'documents_review', 'submitted_transito', 'in_process'] },
    isDeleted: false
  });
};

plateRequestSchema.statics.findOverdue = function() {
  return this.find({
    status: { $nin: ['delivered', 'cancelled'] },
    expectedCompletionDate: { $lt: new Date() },
    isDeleted: false
  });
};

plateRequestSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const PlateRequest = mongoose.model('PlateRequest', plateRequestSchema);

export default PlateRequest;
