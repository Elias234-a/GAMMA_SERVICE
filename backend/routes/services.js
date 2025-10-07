import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as serviceController from '../controllers/serviceController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', serviceController.getServiceStats);
router.get('/technician/:technicianId', serviceController.getServicesByTechnician);
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

router.post('/',
  [
    body('client').notEmpty().withMessage('El cliente es requerido'),
    body('vehicle').notEmpty().withMessage('El vehículo es requerido'),
    body('serviceType').notEmpty().withMessage('El tipo de servicio es requerido'),
    body('description').isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    body('scheduledDate').isISO8601().withMessage('Fecha programada inválida')
  ],
  serviceController.createService
);

router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.patch('/:id/start', serviceController.startService);
router.patch('/:id/complete', serviceController.completeService);
router.patch('/:id/cancel', [body('reason').notEmpty()], serviceController.cancelService);
router.post('/:id/request-approval', [body('estimatedCost').isFloat({ min: 0 })], serviceController.requestApproval);
router.patch('/:id/approve', serviceController.approveService);

export default router;
