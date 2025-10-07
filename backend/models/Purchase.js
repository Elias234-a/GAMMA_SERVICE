import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
    type: String,
    unique: true,
    index: true
  },
  
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'El vehículo es requerido']
  },
  
  supplier: {
    name: {
      type: String,
      required: [true, 'El nombre del proveedor es requerido']
    },
    taxId: String,
    contact: String,
    phone: String,
    email: String,
    address: String
  },
  
  purchaseDate: {
    type: Date,
    required: [true, 'La fecha de compra es requerida'],
    default: Date.now
  },
  
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  
  quantity: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    default: 1,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  
  unitPrice: {
    type: Number,
    required: [true, 'El precio unitario es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'El costo de envío no puede ser negativo']
  },
  
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Los impuestos no pueden ser negativos']
  },
  
  additionalCosts: [{
    concept: String,
    amount: Number
  }],
  
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio total no puede ser negativo']
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'received', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'check', 'credit', 'financing']
  },
  
  paymentTerms: String,
  
  invoiceNumber: String,
  invoiceDate: Date,
  
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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
  timestamps: true
});

purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ vehicle: 1 });

purchaseSchema.pre('save', async function(next) {
  if (!this.purchaseNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Purchase').countDocuments();
    this.purchaseNumber = `PUR-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

purchaseSchema.methods.calculateTotal = function() {
  const subtotal = this.unitPrice * this.quantity;
  const additional = this.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  this.totalPrice = subtotal + this.shippingCost + this.taxes + additional;
  return this.totalPrice;
};

purchaseSchema.methods.markAsReceived = async function(userId) {
  this.status = 'received';
  this.actualDeliveryDate = new Date();
  this.receivedBy = userId;
  
  this.notes.push({
    content: 'Compra recibida',
    createdBy: userId
  });
  
  await this.save();
  return this;
};

purchaseSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

purchaseSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
