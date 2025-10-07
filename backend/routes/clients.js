import express from 'express';
import { auth } from '../middleware/auth.js';
import { body } from 'express-validator';
import * as clientController from '../controllers/clientController.js';

const router = express.Router();

router.use(auth);

// GET stats
router.get('/stats', clientController.getClientStats);

// GET all clients
router.get('/', clientController.getClients);

// GET by ID
router.get('/:id', clientController.getClientById);

// POST create
router.post('/',
  [
    body('firstName').notEmpty().withMessage('El nombre es requerido'),
    body('lastName').notEmpty().withMessage('El apellido es requerido'),
    body('identificationType').isIn(['CC', 'CE', 'NIT', 'TI', 'PAS', 'RUT']).withMessage('Tipo de identificación inválido'),
    body('identificationNumber').notEmpty().withMessage('El número de identificación es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('phone').notEmpty().withMessage('El teléfono es requerido'),
    body('address.city').notEmpty().withMessage('La ciudad es requerida')
  ],
  clientController.createClient
);

// PUT update
router.put('/:id', clientController.updateClient);

// DELETE soft delete
router.delete('/:id', clientController.deleteClient);

// POST evaluate credit
router.post('/:id/evaluate-credit',
  [
    body('score').isInt({ min: 0, max: 1000 }).withMessage('Score crediticio inválido'),
    body('status').isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Estado crediticio inválido')
  ],
  clientController.evaluateCredit
);

export default router;
