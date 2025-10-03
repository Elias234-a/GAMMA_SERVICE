import { Router } from 'express';
import * as transitoController from '../controllers/transitoController.js';
import { auth } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Middleware para validar consultas de vehículos
const validateVehicleCheck = [
  check('placa', 'La placa es requerida').not().isEmpty(),
  check('tipoConsulta', 'Tipo de consulta inválido').optional().isIn(['basica', 'completa'])
];

// Middleware para validar consultas de infracciones
const validateInfractionCheck = [
  check('tipo', 'Tipo de consulta es requerido').isIn(['vehiculo', 'conductor']),
  check('placa', 'La placa es requerida para consulta de vehículo')
    .if((value, { req }) => req.body.tipo === 'vehiculo')
    .not().isEmpty(),
  check('documento', 'El documento es requerido para consulta de conductor')
    .if((value, { req }) => req.body.tipo === 'conductor')
    .not().isEmpty()
];

// Rutas de Tránsito
router.post('/vehiculo', [auth, ...validateVehicleCheck], transitoController.consultarVehiculo);
router.post('/infracciones', [auth, ...validateInfractionCheck], transitoController.consultarInfracciones);
router.get('/historial-propiedad/:placa', auth, transitoController.consultarHistorialPropiedad);
router.get('/comparendos/:numero', auth, transitoController.consultarComparendo);
router.get('/historial', auth, transitoController.consultarHistorialConsultas);

export default router;
