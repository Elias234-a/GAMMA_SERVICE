import mongoose from 'mongoose';

const dianSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  customer: {
    name: String,
    identification: String,
    email: String,
    phone: String
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    tax: Number,
    total: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },
  cufe: String,
  qrCode: String,
  pdfUrl: String,
  xmlUrl: String,
  dianResponse: {}
}, {
  timestamps: true
});

const Dian = mongoose.model('Dian', dianSchema);

export default Dian;
