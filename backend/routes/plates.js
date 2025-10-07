import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as plateController from '../controllers/plateController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', plateController.getPlateStats);
router.get('/pending', plateController.getPendingPlateRequests);
router.get('/overdue', plateController.getOverduePlateRequests);
router.get('/', plateController.getPlateRequests);
router.get('/:id', plateController.getPlateRequestById);
router.post('/', [body('client').notEmpty(), body('vehicle').notEmpty(), body('requestType').notEmpty()], plateController.createPlateRequest);
router.put('/:id', plateController.updatePlateRequest);
router.delete('/:id', plateController.deletePlateRequest);
router.post('/:id/submit', [body('referenceNumber').notEmpty()], plateController.submitToTransito);
router.patch('/:id/ready', [body('plateNumber').notEmpty()], plateController.markAsReady);
router.patch('/:id/deliver', [body('deliveredTo').notEmpty(), body('receivedBy').notEmpty()], plateController.deliverPlate);
router.patch('/:id/cancel', [body('reason').notEmpty()], plateController.cancelPlateRequest);

export default router;
