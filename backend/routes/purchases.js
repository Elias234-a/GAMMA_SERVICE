import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as purchaseController from '../controllers/purchaseController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', purchaseController.getPurchaseStats);
router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', [body('vehicle').notEmpty(), body('unitPrice').isFloat({ min: 0 })], purchaseController.createPurchase);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);
router.patch('/:id/received', purchaseController.markAsReceived);

export default router;
