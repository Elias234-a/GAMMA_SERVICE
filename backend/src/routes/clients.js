import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock clients database
let clients = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+57 300 123 4567',
    document: '12345678',
    documentType: 'CC',
    address: 'Calle 123 #45-67, Bogotá',
    city: 'Bogotá',
    department: 'Cundinamarca',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+57 310 987 6543',
    document: '87654321',
    documentType: 'CC',
    address: 'Carrera 45 #78-90, Medellín',
    city: 'Medellín',
    department: 'Antioquia',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all clients
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let filteredClients = clients;
    
    if (search) {
      filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.document.includes(search)
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClients = filteredClients.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedClients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredClients.length / limit),
        totalItems: filteredClients.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch clients'
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
        error: 'Client not found',
        message: `Client with ID ${clientId} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch client'
    });
  }
});

// Create new client
router.post('/', [
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isMobilePhone(),
  body('document').isLength({ min: 6 }),
  body('documentType').isIn(['CC', 'CE', 'NIT', 'PP']),
  body('city').isLength({ min: 2 }),
  body('department').isLength({ min: 2 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, phone, document, documentType, address, city, department } = req.body;
    
    // Check if client already exists
    const existingClient = clients.find(c => c.document === document || c.email === email);
    if (existingClient) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this document or email already exists'
      });
    }
    
    const newClient = {
      id: clients.length + 1,
      name,
      email,
      phone,
      document,
      documentType,
      address: address || '',
      city,
      department,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    clients.push(newClient);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create client'
    });
  }
});

// Update client
router.put('/:id', [
  body('name').optional().isLength({ min: 2 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('document').optional().isLength({ min: 6 }),
  body('documentType').optional().isIn(['CC', 'CE', 'NIT', 'PP']),
  body('city').optional().isLength({ min: 2 }),
  body('department').optional().isLength({ min: 2 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const clientId = parseInt(req.params.id);
    const clientIndex = clients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return res.status(404).json({
        error: 'Client not found',
        message: `Client with ID ${clientId} does not exist`
      });
    }
    
    const updatedClient = {
      ...clients[clientIndex],
      ...req.body,
      id: clientId,
      updatedAt: new Date()
    };
    
    clients[clientIndex] = updatedClient;
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update client'
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
        error: 'Client not found',
        message: `Client with ID ${clientId} does not exist`
      });
    }
    
    clients.splice(clientIndex, 1);
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete client'
    });
  }
});

export default router;