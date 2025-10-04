import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock workshop orders database
let workshopOrders = [
  {
    id: 1,
    clientId: 1,
    vehicleId: 1,
    clientName: 'Juan Pérez',
    vehicleInfo: 'Toyota Corolla 2024',
    orderNumber: 'WO-2024-001',
    serviceType: 'Mantenimiento Preventivo',
    description: 'Cambio de aceite y filtros',
    estimatedCost: 150000,
    actualCost: 145000,
    estimatedDuration: 2,
    actualDuration: 1.5,
    status: 'Completada',
    priority: 'Normal',
    assignedMechanic: 'Mecánico',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-10'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all workshop orders
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', priority = '' } = req.query;
    
    let filteredOrders = workshopOrders;
    
    if (status) {
      filteredOrders = workshopOrders.filter(order => order.status === status);
    }
    
    if (priority) {
      filteredOrders = filteredOrders.filter(order => order.priority === priority);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredOrders.length / limit),
        totalItems: filteredOrders.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get workshop orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch workshop orders'
    });
  }
});

// Get workshop order by ID
router.get('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = workshopOrders.find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        error: 'Workshop order not found',
        message: `Workshop order with ID ${orderId} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get workshop order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch workshop order'
    });
  }
});

// Create new workshop order
router.post('/', [
  body('clientId').isInt({ min: 1 }),
  body('vehicleId').isInt({ min: 1 }),
  body('serviceType').isLength({ min: 2 }).trim(),
  body('description').isLength({ min: 5 }).trim(),
  body('estimatedCost').isFloat({ min: 0 }),
  body('estimatedDuration').isFloat({ min: 0 }),
  body('priority').isIn(['Baja', 'Normal', 'Alta', 'Urgente'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      clientId, vehicleId, serviceType, description, estimatedCost,
      estimatedDuration, priority, assignedMechanic, startDate
    } = req.body;
    
    const orderNumber = `WO-${new Date().getFullYear()}-${String(workshopOrders.length + 1).padStart(3, '0')}`;
    
    const newOrder = {
      id: workshopOrders.length + 1,
      clientId,
      vehicleId,
      clientName: 'Cliente', // En producción se obtendría de la base de datos
      vehicleInfo: 'Vehículo', // En producción se obtendría de la base de datos
      orderNumber,
      serviceType,
      description,
      estimatedCost,
      actualCost: 0,
      estimatedDuration,
      actualDuration: 0,
      status: 'Pendiente',
      priority: priority || 'Normal',
      assignedMechanic: assignedMechanic || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    workshopOrders.push(newOrder);
    
    res.status(201).json({
      success: true,
      message: 'Workshop order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create workshop order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create workshop order'
    });
  }
});

// Update workshop order
router.put('/:id', [
  body('serviceType').optional().isLength({ min: 2 }).trim(),
  body('description').optional().isLength({ min: 5 }).trim(),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('actualCost').optional().isFloat({ min: 0 }),
  body('estimatedDuration').optional().isFloat({ min: 0 }),
  body('actualDuration').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['Pendiente', 'En Proceso', 'Completada', 'Cancelada']),
  body('priority').optional().isIn(['Baja', 'Normal', 'Alta', 'Urgente'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const orderId = parseInt(req.params.id);
    const orderIndex = workshopOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Workshop order not found',
        message: `Workshop order with ID ${orderId} does not exist`
      });
    }
    
    const updatedOrder = {
      ...workshopOrders[orderIndex],
      ...req.body,
      id: orderId,
      updatedAt: new Date()
    };
    
    workshopOrders[orderIndex] = updatedOrder;
    
    res.json({
      success: true,
      message: 'Workshop order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update workshop order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update workshop order'
    });
  }
});

// Delete workshop order
router.delete('/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = workshopOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: 'Workshop order not found',
        message: `Workshop order with ID ${orderId} does not exist`
      });
    }
    
    workshopOrders.splice(orderIndex, 1);
    
    res.json({
      success: true,
      message: 'Workshop order deleted successfully'
    });
  } catch (error) {
    console.error('Delete workshop order error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete workshop order'
    });
  }
});

export default router;