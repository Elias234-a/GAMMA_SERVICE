import express from 'express';
import { auth } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.use(auth);

router.get('/general', reportController.getGeneralStats);
router.get('/sales', reportController.getSalesReport);
router.get('/clients', reportController.getClientsReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/financial', reportController.getFinancialReport);
router.get('/services', reportController.getServiceReport);

export default router;
