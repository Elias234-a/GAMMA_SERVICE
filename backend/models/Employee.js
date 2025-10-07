import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  
  employeeNumber: {
    type: String,
    unique: true,
    index: true
  },
  
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'El nombre es requerido']
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es requerido']
    },
    identificationType: String,
    identificationNumber: {
      type: String,
      required: true,
      unique: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'other']
    },
    bloodType: String
  },
  
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    mobile: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Colombia'
      }
    }
  },
  
  emergency: {
    contactName: String,
    relationship: String,
    phone: String
  },
  
  employment: {
    position: {
      type: String,
      required: [true, 'El cargo es requerido']
    },
    department: {
      type: String,
      required: [true, 'El departamento es requerido'],
      enum: ['sales', 'service', 'parts', 'administration', 'management', 'finance', 'hr', 'it']
    },
    hireDate: {
      type: Date,
      required: [true, 'La fecha de contratación es requerida'],
      default: Date.now
    },
    contractType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary', 'intern'],
      default: 'full-time'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'suspended', 'terminated'],
      default: 'active'
    },
    terminationDate: Date,
    terminationReason: String
  },
  
  compensation: {
    salary: {
      type: Number,
      required: [true, 'El salario es requerido'],
      min: [0, 'El salario no puede ser negativo']
    },
    payFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      default: 'monthly'
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: [0, 'La comisión no puede ser negativa'],
      max: [100, 'La comisión no puede ser mayor a 100%']
    },
    bonuses: [{
      type: String,
      amount: Number,
      date: Date,
      reason: String
    }]
  },
  
  schedule: {
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String,
    hoursPerWeek: {
      type: Number,
      default: 40
    }
  },
  
  benefits: [{
    type: String,
    description: String,
    startDate: Date,
    endDate: Date
  }],
  
  performance: {
    reviews: [{
      date: Date,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    goals: [{
      description: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled']
      },
      completionDate: Date
    }],
    disciplinaryActions: [{
      date: Date,
      type: String,
      reason: String,
      action: String,
      documentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  attendance: {
    totalAbsences: {
      type: Number,
      default: 0
    },
    totalLateDays: {
      type: Number,
      default: 0
    },
    vacationDaysEarned: {
      type: Number,
      default: 15
    },
    vacationDaysUsed: {
      type: Number,
      default: 0
    },
    sickDaysUsed: {
      type: Number,
      default: 0
    }
  },
  
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['id', 'contract', 'certification', 'medical', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isConfidential: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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

employeeSchema.index({ employeeNumber: 1 });
employeeSchema.index({ 'employment.status': 1 });
employeeSchema.index({ 'employment.department': 1 });

employeeSchema.pre('save', async function(next) {
  if (!this.employeeNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeNumber = `EMP-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

employeeSchema.virtual('vacationDaysRemaining').get(function() {
  return this.attendance.vacationDaysEarned - this.attendance.vacationDaysUsed;
});

employeeSchema.methods.terminate = async function(reason, userId) {
  this.employment.status = 'terminated';
  this.employment.terminationDate = new Date();
  this.employment.terminationReason = reason;
  
  this.notes.push({
    content: `Empleado terminado. Razón: ${reason}`,
    createdBy: userId,
    isConfidential: true
  });
  
  await this.save();
  return this;
};

employeeSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

employeeSchema.statics.findActive = function() {
  return this.find({ 'employment.status': 'active', isDeleted: false });
};

employeeSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.find({ isDeleted: false });
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
