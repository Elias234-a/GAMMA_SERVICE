import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', inventoryController.getInventoryStats);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/needing-reorder', inventoryController.getNeedingReorder);
router.get('/', inventoryController.getInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', [body('vehicle').notEmpty()], inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);
router.post('/:id/entry', [body('quantity').isInt({ min: 1 })], inventoryController.registerEntry);
router.post('/:id/exit', [body('quantity').isInt({ min: 1 })], inventoryController.registerExit);
router.post('/:id/transfer', [body('toLocation').notEmpty()], inventoryController.transferLocation);
router.post('/:id/audit', [body('actualQuantity').isInt({ min: 0 })], inventoryController.performAudit);

export default router;
