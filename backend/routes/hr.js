import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as hrController from '../controllers/hrController.js';

const router = express.Router();

router.use(auth);

router.get('/stats', hrController.getEmployeeStats);
router.get('/', hrController.getEmployees);
router.get('/:id', hrController.getEmployeeById);
router.post('/', [body('user').notEmpty(), body('personalInfo.firstName').notEmpty()], hrController.createEmployee);
router.put('/:id', hrController.updateEmployee);
router.delete('/:id', hrController.deleteEmployee);
router.patch('/:id/terminate', [body('reason').notEmpty()], hrController.terminateEmployee);
router.post('/:id/reviews', [body('rating').isInt({ min: 1, max: 5 })], hrController.addPerformanceReview);

export default router;
