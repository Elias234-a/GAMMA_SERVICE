import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Índice para limpieza automática de tokens expirados
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método estático para crear un token de reset
passwordResetSchema.statics.createResetToken = async function(userId, ipAddress, userAgent) {
  // Generar token aleatorio seguro
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Invalidar tokens anteriores del usuario
  await this.updateMany(
    { user: userId, used: false },
    { used: true, usedAt: new Date() }
  );
  
  // Crear nuevo token (válido por 1 hora)
  const resetToken = await this.create({
    user: userId,
    token: token.substring(0, 64), // Guardar parte del token
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    ipAddress,
    userAgent
  });
  
  // Retornar el token completo (solo esta vez)
  return token;
};

// Método estático para verificar token
passwordResetSchema.statics.verifyToken = async function(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const resetToken = await this.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('user');
  
  return resetToken;
};

// Método para marcar token como usado
passwordResetSchema.methods.markAsUsed = async function() {
  this.used = true;
  this.usedAt = new Date();
  await this.save();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
