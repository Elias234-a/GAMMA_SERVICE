const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock users database (en producción usar MongoDB)
const users = [
  {
    id: 1,
    email: 'admin@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'Administrador',
    name: 'Administrador',
    createdAt: new Date()
  },
  {
    id: 2,
    email: 'vendedor@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // vendedor123
    role: 'Vendedor',
    name: 'Vendedor',
    createdAt: new Date()
  },
  {
    id: 3,
    email: 'mecanico@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // mecanico123
    role: 'Mecánico',
    name: 'Mecánico',
    createdAt: new Date()
  },
  {
    id: 4,
    email: 'cliente@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // cliente123
    role: 'Cliente',
    name: 'Cliente',
    createdAt: new Date()
  }
];

// JWT Secret (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('role').notEmpty().withMessage('Rol es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Find user
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email, contraseña o rol incorrectos'
      });
    }

    // Verify password (en este caso usamos contraseñas simples para demo)
    const validPassword = password === 'admin123' || password === 'vendedor123' || 
                         password === 'mecanico123' || password === 'cliente123';
    
    if (!validPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Contraseña incorrecta'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al procesar el login'
    });
  }
});

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('role').notEmpty().withMessage('Rol es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { email, password, name, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role,
      name,
      phone: phone || '',
      address: address || '',
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al registrar usuario'
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Token no proporcionado',
      message: 'Se requiere token de autenticación'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'Token válido pero usuario no existe'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    res.status(401).json({
      error: 'Token inválido',
      message: 'El token ha expirado o es inválido'
    });
  }
});

// Logout endpoint (opcional, ya que JWT es stateless)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

module.exports = router;