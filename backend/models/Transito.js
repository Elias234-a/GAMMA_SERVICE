import mongoose from 'mongoose';

const transitoSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  brand: String,
  model: String,
  year: Number,
  color: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: String,
  ownerId: String,
  soat: {
    number: String,
    expiration: Date,
    insuranceCompany: String
  },
  tecnomecanica: {
    number: String,
    expiration: Date,
    serviceCenter: String
  },
  trafficTickets: [{
    number: String,
    date: Date,
    infraction: String,
    value: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'in_dispute', 'cancelled'],
      default: 'pending'
    },
    paymentDate: Date
  }],
  isStolen: {
    type: Boolean,
    default: false
  },
  hasRestrictions: {
    type: Boolean,
    default: false
  },
  lastUpdate: Date
}, {
  timestamps: true
});

const Transito = mongoose.model('Transito', transitoSchema);

export default Transito;
