import { Router } from 'express';
import * as technicianController from '../controllers/technicianController.js';
import { auth } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Middleware para validar datos de entrada
const validateTechnician = [
  check('user', 'El ID de usuario es requerido').not().isEmpty(),
  check('specialty', 'La especialidad es requerida').not().isEmpty(),
  check('skills', 'Las habilidades deben ser un arreglo').optional().isArray(),
  check('experience', 'La experiencia debe ser un número').optional().isNumeric(),
  check('status', 'Estado no válido').optional().isIn(['active', 'inactive', 'on_leave', 'on_vacation'])
];

// Rutas de técnicos
router.post('/', [auth, ...validateTechnician], technicianController.createTechnician);
router.get('/', auth, technicianController.getTechnicians);
router.get('/nearby', auth, technicianController.findNearbyTechnicians);
router.get('/:id', auth, technicianController.getTechnicianById);
router.put('/:id', [auth, ...validateTechnician], technicianController.updateTechnician);
router.put('/:id/location', [
  auth,
  check('coordinates', 'Coordenadas inválidas').isArray({ min: 2, max: 2 })
], technicianController.updateLocation);
router.get('/:id/stats', auth, technicianController.getTechnicianStats);

export default router;
