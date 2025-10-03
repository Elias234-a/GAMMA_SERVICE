import express from 'express';
import { Router } from 'express';
import * as datacreditoController from '../controllers/datacreditoController.js';
import { auth } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Middleware para validar consultas de crédito
const validateCreditCheck = [
  check('identification', 'La identificación es requerida').not().isEmpty(),
  check('identificationType', 'El tipo de identificación es requerido').isIn(['CC', 'CE', 'NIT', 'PASAPORTE']),
  check('firstName', 'El primer nombre es requerido').not().isEmpty(),
  check('lastName', 'El apellido es requerido').not().isEmpty(),
  check('email', 'Correo electrónico inválido').isEmail(),
  check('phone', 'Número de teléfono inválido').isMobilePhone()
];

// Rutas de Datacrédito
router.post('/consult', [auth, ...validateCreditCheck], datacreditoController.consultCreditReport);
router.get('/history', auth, datacreditoController.getConsultationHistory);
router.get('/reports/:id', auth, datacreditoController.getReportDetails);
router.post('/alerts', [
  auth,
  check('identification', 'La identificación es requerida').not().isEmpty(),
  check('email', 'Correo electrónico inválido').optional().isEmail(),
  check('phone', 'Número de teléfono inválido').optional().isMobilePhone(),
  check('alertTypes', 'Debe especificar al menos un tipo de alerta').isArray({ min: 1 })
], datacreditoController.setupCreditAlerts);
router.post('/validate-id', [
  auth,
  check('identification', 'La identificación es requerida').not().isEmpty(),
  check('firstName', 'El primer nombre es requerido').not().isEmpty(),
  check('lastName', 'El apellido es requerido').not().isEmpty(),
  check('birthDate', 'Fecha de nacimiento inválida').isISO8601()
], datacreditoController.validateIdentity);

export default router;
