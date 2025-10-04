import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user database (replace with real database in production)
const users = [
  {
    id: 1,
    email: 'admin@sistema.com',
    password: '$2b$10$XjHBDhvZPq8.7QW8m7jLVu8N5bXC4R.XnJ5m2dA3K0w5M4h0R6zLW', // admin123
    name: 'Administrador',
    role: 'Administrador'
  },
  {
    id: 2,
    email: 'ventas@sistema.com',
    password: '$2b$10$XjHBDhvZPq8.7QW8m7jLVu8N5bXC4R.XnJ5m2dA3K0w5M4h0R6zLW', // ventas123
    name: 'Vendedor',
    role: 'Vendedor'
  },
  {
    id: 3,
    email: 'mecanico@sistema.com',
    password: '$2b$10$XjHBDhvZPq8.7QW8m7jLVu8N5bXC4R.XnJ5m2dA3K0w5M4h0R6zLW', // mecanico123
    name: 'Mecánico',
    role: 'Mecánico'
  },
  {
    id: 4,
    email: 'cliente@sistema.com',
    password: '$2b$10$XjHBDhvZPq8.7QW8m7jLVu8N5bXC4R.XnJ5m2dA3K0w5M4h0R6zLW', // cliente123
    name: 'Cliente',
    role: 'Cliente'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // For demo purposes, we'll accept the plain passwords
    // In production, use: const isPasswordValid = await bcrypt.compare(password, user.password);
    const validPasswords = {
      'admin@sistema.com': 'admin123',
      'ventas@sistema.com': 'ventas123',
      'mecanico@sistema.com': 'mecanico123',
      'cliente@sistema.com': 'cliente123'
    };

    const isPasswordValid = validPasswords[email.toLowerCase()] === password;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido', valid: false });
  }
});

// Logout endpoint (client-side token removal is sufficient, but we keep this for consistency)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

export default router;
