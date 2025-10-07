import mongoose from 'mongoose';

const financingSchema = new mongoose.Schema({
  applicationNumber: {
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
  
  requestedAmount: {
    type: Number,
    required: [true, 'El monto solicitado es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  
  approvedAmount: {
    type: Number,
    min: [0, 'El monto no puede ser negativo']
  },
  
  downPayment: {
    type: Number,
    required: [true, 'La cuota inicial es requerida'],
    min: [0, 'La cuota inicial no puede ser negativa']
  },
  
  interestRate: {
    type: Number,
    required: [true, 'La tasa de interés es requerida'],
    min: [0, 'La tasa no puede ser negativa']
  },
  
  term: {
    type: Number,
    required: [true, 'El plazo es requerido'],
    min: [1, 'El plazo debe ser al menos 1 mes']
  },
  
  monthlyPayment: {
    type: Number,
    min: [0, 'El pago mensual no puede ser negativo']
  },
  
  financialEntity: {
    name: {
      type: String,
      required: [true, 'La entidad financiera es requerida']
    },
    type: {
      type: String,
      enum: ['bank', 'credit_union', 'financing_company', 'leasing', 'internal'],
      default: 'bank'
    },
    contact: String,
    phone: String,
    email: String
  },
  
  applicationType: {
    type: String,
    enum: ['loan', 'leasing', 'line_of_credit', 'internal_financing'],
    default: 'loan'
  },
  
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled', 'disbursed'],
    default: 'pending'
  },
  
  applicationDate: {
    type: Date,
    required: [true, 'La fecha de solicitud es requerida'],
    default: Date.now
  },
  
  reviewDate: Date,
  approvalDate: Date,
  disbursementDate: Date,
  rejectionDate: Date,
  
  approvalNumber: String,
  contractNumber: String,
  
  creditEvaluation: {
    score: {
      type: Number,
      min: [0, 'Score inválido'],
      max: [1000, 'Score inválido']
    },
    status: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'not_evaluated'],
      default: 'not_evaluated'
    },
    datacreditoReport: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluationDate: Date,
    notes: String
  },
  
  clientIncome: {
    monthlyIncome: {
      type: Number,
      min: [0, 'Ingreso inválido']
    },
    incomeSource: String,
    employmentType: {
      type: String,
      enum: ['employed', 'self-employed', 'business_owner', 'retired', 'other']
    },
    employerName: String,
    yearsEmployed: Number,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  obligations: {
    currentDebts: [{
      creditor: String,
      amount: Number,
      monthlyPayment: Number,
      remainingBalance: Number
    }],
    totalMonthlyObligations: {
      type: Number,
      default: 0
    }
  },
  
  debtToIncomeRatio: {
    type: Number,
    min: [0, 'Ratio inválido'],
    max: [100, 'Ratio inválido']
  },
  
  loanToValueRatio: {
    type: Number,
    min: [0, 'LTV inválido'],
    max: [100, 'LTV inválido']
  },
  
  coApplicants: [{
    name: String,
    identificationType: String,
    identificationNumber: String,
    relationship: String,
    income: Number,
    creditScore: Number
  }],
  
  guarantees: [{
    type: {
      type: String,
      enum: ['vehicle', 'property', 'personal_guarantee', 'deposit', 'other']
    },
    description: String,
    value: Number,
    owner: String
  }],
  
  requiredDocuments: [{
    name: String,
    type: String,
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
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  comments: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  rejectionReason: String,
  cancellationReason: String,
  
  conditions: [{
    description: String,
    isMandatory: {
      type: Boolean,
      default: false
    },
    fulfilled: {
      type: Boolean,
      default: false
    }
  }],
  
  insuranceRequired: {
    type: Boolean,
    default: true
  },
  
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    coverage: String,
    premium: Number,
    startDate: Date,
    endDate: Date
  },
  
  paymentSchedule: [{
    paymentNumber: Number,
    dueDate: Date,
    amount: Number,
    principal: Number,
    interest: Number,
    balance: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'late', 'defaulted'],
      default: 'pending'
    },
    paidDate: Date
  }],
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

financingSchema.index({ applicationNumber: 1 });
financingSchema.index({ client: 1 });
financingSchema.index({ status: 1 });
financingSchema.index({ applicationDate: -1 });

financingSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Financing').countDocuments();
    this.applicationNumber = `FIN-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

financingSchema.virtual('totalAmountFinanced').get(function() {
  return this.requestedAmount - this.downPayment;
});

financingSchema.virtual('totalInterest').get(function() {
  if (!this.monthlyPayment || !this.term) return 0;
  return (this.monthlyPayment * this.term) - this.totalAmountFinanced;
});

financingSchema.methods.calculateMonthlyPayment = function() {
  const principal = this.requestedAmount - this.downPayment;
  const monthlyRate = (this.interestRate / 100) / 12;
  const numberOfPayments = this.term;
  
  if (monthlyRate === 0) {
    this.monthlyPayment = principal / numberOfPayments;
  } else {
    this.monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }
  
  return Math.round(this.monthlyPayment);
};

financingSchema.methods.calculateDebtToIncomeRatio = function() {
  if (!this.clientIncome.monthlyIncome || this.clientIncome.monthlyIncome === 0) {
    return 0;
  }
  
  const totalDebt = this.obligations.totalMonthlyObligations + this.monthlyPayment;
  this.debtToIncomeRatio = (totalDebt / this.clientIncome.monthlyIncome) * 100;
  
  return this.debtToIncomeRatio;
};

financingSchema.methods.approve = async function(approvedAmount, userId) {
  this.status = 'approved';
  this.approvedAmount = approvedAmount || this.requestedAmount;
  this.approvalDate = new Date();
  this.approvedBy = userId;
  
  this.comments.push({
    content: `Financiamiento aprobado por $${this.approvedAmount}`,
    createdBy: userId,
    isInternal: true
  });
  
  await this.save();
  return this;
};

financingSchema.methods.reject = async function(reason, userId) {
  this.status = 'rejected';
  this.rejectionDate = new Date();
  this.rejectionReason = reason;
  
  this.comments.push({
    content: `Financiamiento rechazado. Razón: ${reason}`,
    createdBy: userId,
    isInternal: true
  });
  
  await this.save();
  return this;
};

financingSchema.methods.disburse = async function(userId) {
  if (this.status !== 'approved') {
    throw new Error('Solo se pueden desembolsar financiamientos aprobados');
  }
  
  this.status = 'disbursed';
  this.disbursementDate = new Date();
  
  this.comments.push({
    content: 'Financiamiento desembolsado',
    createdBy: userId,
    isInternal: true
  });
  
  await this.save();
  return this;
};

financingSchema.methods.generatePaymentSchedule = function() {
  this.paymentSchedule = [];
  let balance = this.approvedAmount || this.requestedAmount - this.downPayment;
  const monthlyRate = (this.interestRate / 100) / 12;
  
  for (let i = 1; i <= this.term; i++) {
    const interest = balance * monthlyRate;
    const principal = this.monthlyPayment - interest;
    balance -= principal;
    
    const dueDate = new Date(this.disbursementDate || this.approvalDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    this.paymentSchedule.push({
      paymentNumber: i,
      dueDate,
      amount: Math.round(this.monthlyPayment),
      principal: Math.round(principal),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(balance)),
      status: 'pending'
    });
  }
  
  return this.paymentSchedule;
};

financingSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

financingSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['pending', 'under_review'] }, isDeleted: false });
};

financingSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Financing = mongoose.model('Financing', financingSchema);

export default Financing;
