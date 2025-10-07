import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as vehicleController from '../controllers/vehicleController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET stats (antes de /:id para evitar conflictos)
router.get('/stats', vehicleController.getVehicleStats);

// GET available
router.get('/available', vehicleController.getAvailableVehicles);

// GET all vehicles
router.get('/', vehicleController.getVehicles);

// GET by ID
router.get('/:id', vehicleController.getVehicleById);

// POST create
router.post('/',
  [
    body('brand').notEmpty().withMessage('La marca es requerida'),
    body('model').notEmpty().withMessage('El modelo es requerido'),
    body('year').isInt({ min: 1900 }).withMessage('Año inválido'),
    body('vin').isLength({ min: 17, max: 17 }).withMessage('VIN debe tener 17 caracteres'),
    body('color').notEmpty().withMessage('El color es requerido'),
    body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('cost').isFloat({ min: 0 }).withMessage('Costo inválido'),
    body('category').isIn(['sedan', 'suv', 'truck', 'van', 'coupe', 'hatchback', 'convertible', 'motorcycle', 'other']).withMessage('Categoría inválida'),
    body('transmission').isIn(['manual', 'automatic', 'cvt', 'dual-clutch']).withMessage('Transmisión inválida'),
    body('fuel').isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'plugin-hybrid', 'gas']).withMessage('Combustible inválido')
  ],
  vehicleController.createVehicle
);

// PUT update
router.put('/:id', vehicleController.updateVehicle);

// DELETE soft delete
router.delete('/:id', vehicleController.deleteVehicle);

// PATCH mark as sold
router.patch('/:id/sold',
  [body('clientId').notEmpty().withMessage('El ID del cliente es requerido')],
  vehicleController.markAsSold
);

// POST upload images
router.post('/:id/images', vehicleController.uploadImages);

// POST add note
router.post('/:id/notes',
  [body('content').notEmpty().withMessage('El contenido de la nota es requerido')],
  vehicleController.addNote
);

export default router;
