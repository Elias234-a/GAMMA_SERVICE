import express from 'express';
import { 
  forgotPassword, 
  resetPassword, 
  changePassword,
  validatePasswordStrength 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiters específicos para autenticación
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Máximo 3 intentos
  message: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en 15 minutos.',
      retryAfter: 15 * 60
    });
  }
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: 'Demasiados intentos de reset. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de cambio de contraseña.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar reset de contraseña
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.post('/reset-password', resetPasswordLimiter, resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña (usuario autenticado)
 * @access  Private
 */
router.post('/change-password', protect, changePasswordLimiter, changePassword);

/**
 * @route   POST /api/auth/validate-password
 * @desc    Validar fortaleza de contraseña
 * @access  Private
 */
router.post('/validate-password', protect, validatePasswordStrength);

export default router;
