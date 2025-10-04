const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock clients database
let clients = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+57 300 123 4567',
    address: 'Calle 123 #45-67, Bogotá',
    documentType: 'CC',
    documentNumber: '12345678',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria.garcia@email.com',
    phone: '+57 310 987 6543',
    address: 'Carrera 45 #78-90, Medellín',
    documentType: 'CC',
    documentNumber: '87654321',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all clients
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let filteredClients = clients;
    
    // Search filter
    if (search) {
      filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.documentNumber.includes(search)
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedClients,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredClients.length / limit),
        count: filteredClients.length
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener clientes'
    });
  }
});

// Get client by ID
router.get('/:id', (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No se encontró el cliente con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener cliente'
    });
  }
});

// Create new client
router.post('/', [
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('Teléfono es requerido'),
  body('address').notEmpty().withMessage('Dirección es requerida'),
  body('documentType').notEmpty().withMessage('Tipo de documento es requerido'),
  body('documentNumber').notEmpty().withMessage('Número de documento es requerido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { name, email, phone, address, documentType, documentNumber } = req.body;
    
    // Check if client already exists
    const existingClient = clients.find(c => 
      c.email === email || c.documentNumber === documentNumber
    );
    
    if (existingClient) {
      return res.status(409).json({
        error: 'Cliente ya existe',
        message: 'Ya existe un cliente con este email o documento'
      });
    }

    const newClient = {
      id: clients.length + 1,
      name,
      email,
      phone,
      address,
      documentType,
      documentNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    clients.push(newClient);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: newClient
    });

  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear cliente'
    });
  }
});

// Update client
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nombre no puede estar vacío'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('phone').optional().notEmpty().withMessage('Teléfono no puede estar vacío'),
  body('address').optional().notEmpty().withMessage('Dirección no puede estar vacía')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const clientId = parseInt(req.params.id);
    const clientIndex = clients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No se encontró el cliente con el ID proporcionado'
      });
    }

    const updatedClient = {
      ...clients[clientIndex],
      ...req.body,
      updatedAt: new Date()
    };

    clients[clientIndex] = updatedClient;

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: updatedClient
    });

  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar cliente'
    });
  }
});

// Delete client
router.delete('/:id', (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const clientIndex = clients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No se encontró el cliente con el ID proporcionado'
      });
    }

    const deletedClient = clients.splice(clientIndex, 1)[0];

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: deletedClient
    });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar cliente'
    });
  }
});

module.exports = router;