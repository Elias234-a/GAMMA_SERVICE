import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  legalName: {
    type: String,
    required: true,
    trim: true
  },
  taxId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  taxRegime: {
    type: String,
    required: true
  },
  dianEnabled: {
    type: Boolean,
    default: false
  },
  dianResolution: {
    number: String,
    from: String,
    to: String,
    fromDate: Date,
    toDate: Date
  },
  software: {
    id: String,
    pin: String,
    name: String,
    version: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar la fecha de modificación antes de guardar
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Company = mongoose.model('Company', companySchema);

export default Company;
