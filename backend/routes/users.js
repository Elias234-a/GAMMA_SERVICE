import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// Middleware de validación
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  };
};

// Validaciones comunes
const emailValidation = body('email')
  .trim()
  .isEmail()
  .withMessage('Por favor ingresa un correo electrónico válido')
  .normalizeEmail();

const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('La contraseña debe tener al menos 8 caracteres')
  .matches(/[A-Z]/)
  .withMessage('La contraseña debe contener al menos una letra mayúscula')
  .matches(/[a-z]/)
  .withMessage('La contraseña debe contener al menos una letra minúscula')
  .matches(/[0-9]/)
  .withMessage('La contraseña debe contener al menos un número')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('La contraseña debe contener al menos un carácter especial');

// Rutas públicas
router.post(
  '/register',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    emailValidation,
    passwordValidation,
    body('role')
      .optional()
      .isIn(['user', 'admin', 'technician'])
      .withMessage('Rol no válido')
  ]),
  userController.createUser
);

router.post(
  '/login',
  validate([
    emailValidation,
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ]),
  userController.login
);

// Rutas protegidas
router.get('/profile', auth, userController.getProfile);

router.put(
  '/profile',
  auth,
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    emailValidation.optional(),
    body('currentPassword')
      .if(body('newPassword').exists())
      .notEmpty()
      .withMessage('La contraseña actual es requerida para cambiar la contraseña'),
    body('newPassword')
      .if(body('currentPassword').exists())
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
  ]),
  userController.updateProfile
);

router.post('/logout', auth, userController.logout);
router.post('/logoutAll', auth, userController.logoutAll);

export default router;
