import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { validatePassword } from '../utils/passwordValidator.js';
import { auditAuth } from '../middleware/auditLogger.js';
import logger from '../config/logger.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// Configurar transporter de email
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * POST /api/auth/forgot-password
 * Solicitar reset de contraseña
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }
    
    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Por seguridad, siempre retornar el mismo mensaje
    // aunque el usuario no exista
    const successMessage = {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación'
    };
    
    if (!user) {
      // Log de intento con email inexistente
      logger.warn('Password reset attempt with non-existent email', { email });
      return res.json(successMessage);
    }
    
    // Crear token de reset
    const resetToken = await PasswordReset.createResetToken(
      user._id,
      req.ip,
      req.get('user-agent')
    );
    
    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // Enviar email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Recuperación de Contraseña - GAMMA Service',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperación de Contraseña</h2>
            <p>Hola ${user.name},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz click en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #F97316; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, ignora este email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Por seguridad, nunca compartas este enlace con nadie.<br>
              Si tienes problemas, contacta con soporte.
            </p>
          </div>
        `
      });
      
      logger.info('Password reset email sent', { 
        userId: user.id, 
        email: user.email 
      });
      
      // Log de auditoría
      await auditAuth(user, 'PASSWORD_RESET_REQUEST', req, true);
      
    } catch (emailError) {
      logger.error('Error sending password reset email:', emailError);
      // No revelar error de email por seguridad
    }
    
    res.json(successMessage);
    
  } catch (error) {
    logger.error('Error in forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña con token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }
    
    // Verificar token
    const resetToken = await PasswordReset.verifyToken(token);
    
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    const user = resetToken.user;
    
    // Validar nueva contraseña
    const validation = validatePassword(newPassword, {
      email: user.email,
      name: user.name
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña no cumple con los requisitos de seguridad',
        errors: validation.errors
      });
    }
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    // Marcar token como usado
    await resetToken.markAsUsed();
    
    // Invalidar todas las sesiones activas (opcional)
    // user.tokenVersion += 1;
    // await user.save();
    
    logger.info('Password reset successful', { userId: user.id });
    
    // Log de auditoría
    await auditAuth(user, 'PASSWORD_RESET_SUCCESS', req, true);
    
    // Enviar email de confirmación
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Contraseña Actualizada - GAMMA Service',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Contraseña Actualizada</h2>
            <p>Hola ${user.name},</p>
            <p>Tu contraseña ha sido actualizada exitosamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
            <p><strong>IP:</strong> ${req.ip}</p>
            <p>Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
          </div>
        `
      });
    } catch (emailError) {
      logger.error('Error sending password change confirmation:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña'
    });
  }
};

/**
 * POST /api/auth/change-password
 * Cambiar contraseña (usuario autenticado)
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }
    
    // Buscar usuario
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      await auditAuth(user, 'PASSWORD_CHANGED', req, false);
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Validar nueva contraseña
    const validation = validatePassword(newPassword, {
      email: user.email,
      name: user.name
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña no cumple con los requisitos',
        errors: validation.errors
      });
    }
    
    // No permitir misma contraseña
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual'
      });
    }
    
    // Actualizar contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    logger.info('Password changed successfully', { userId: user.id });
    
    // Log de auditoría
    await auditAuth(user, 'PASSWORD_CHANGED', req, true);
    
    // Enviar email de notificación
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Contraseña Cambiada - GAMMA Service',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Contraseña Cambiada</h2>
            <p>Hola ${user.name},</p>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX')}</p>
            <p><strong>IP:</strong> ${req.ip}</p>
            <p>Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
          </div>
        `
      });
    } catch (emailError) {
      logger.error('Error sending password change notification:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    logger.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña'
    });
  }
};

/**
 * POST /api/auth/validate-password
 * Validar fortaleza de contraseña
 */
export const validatePasswordStrength = (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es requerida'
      });
    }
    
    const validation = validatePassword(password, req.user);
    
    res.json({
      success: true,
      data: {
        valid: validation.valid,
        strength: validation.strength,
        errors: validation.errors,
        suggestions: validation.errors.length > 0 ? 
          require('../utils/passwordValidator.js').getPasswordSuggestions(password) : []
      }
    });
    
  } catch (error) {
    logger.error('Error validating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar la contraseña'
    });
  }
};

export default {
  forgotPassword,
  resetPassword,
  changePassword,
  validatePasswordStrength
};
