import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.post('/register', userController.createUser);
router.post('/login', userController.login);

// Rutas protegidas
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/logout', auth, userController.logout);
router.post('/logoutAll', auth, userController.logoutAll);

export default router;
