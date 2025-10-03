import mongoose from 'mongoose';

const datacreditoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  identification: {
    type: String,
    required: true
  },
  fullName: String,
  score: Number,
  scoreDate: Date,
  status: String,
  creditHistory: [{
    entity: String,
    product: String,
    status: String,
    dueDate: Date,
    balance: Number,
    quota: Number
  }],
  inquiries: [{
    date: Date,
    entity: String,
    reason: String
  }],
  lastUpdate: Date,
  isApproved: Boolean,
  riskLevel: String,
  report: {}
}, {
  timestamps: true
});

const Datacredito = mongoose.model('Datacredito', datacreditoSchema);

export default Datacredito;
