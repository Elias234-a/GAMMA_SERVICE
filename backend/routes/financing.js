import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as financingController from '../controllers/financingController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', financingController.getFinancingStats);
router.get('/', financingController.getFinancingApplications);
router.get('/:id', financingController.getFinancingById);
router.post('/', [body('client').notEmpty(), body('vehicle').notEmpty(), body('requestedAmount').isFloat({ min: 0 })], financingController.createFinancingApplication);
router.put('/:id', financingController.updateFinancing);
router.delete('/:id', financingController.deleteFinancing);
router.post('/:id/evaluate', [body('score').isInt({ min: 0, max: 1000 })], financingController.evaluateCredit);
router.patch('/:id/approve', financingController.approveFinancing);
router.patch('/:id/reject', [body('reason').notEmpty()], financingController.rejectFinancing);
router.patch('/:id/disburse', financingController.disburseFinancing);
router.post('/:id/payment-schedule', financingController.generatePaymentSchedule);

export default router;
