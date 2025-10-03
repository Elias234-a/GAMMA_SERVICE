import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';

// Crear un nuevo usuario
export const createUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    // Crear notificación de bienvenida
    await createNotification(
      user._id,
      'info',
      'Bienvenido',
      '¡Bienvenido a nuestro sistema! Su cuenta ha sido creada exitosamente.'
    );
    
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    next(error);
  }
};

// Iniciar sesión
export const login = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario actual
export const getProfile = (req, res) => {
  res.send(req.user);
};

// Actualizar Perfil
export const updateProfile = async (req, res, next) => {
  const allowedUpdates = ['name', 'email', 'password', 'phone', 'address'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Actualización no permitida' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    next(error);
  }
};

// Cerrar sesión
export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

// Cerrar todas las sesiones
export const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
};
