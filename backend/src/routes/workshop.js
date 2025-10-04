const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock workshop services database
let services = [
  {
    id: 1,
    clientId: 1,
    vehicleId: 2,
    serviceType: 'Mantenimiento',
    description: 'Cambio de aceite y filtros',
    status: 'Completado',
    startDate: new Date('2023-03-10'),
    endDate: new Date('2023-03-12'),
    estimatedCost: 150000,
    actualCost: 145000,
    laborHours: 2,
    mechanicId: 3,
    notes: 'Servicio completado sin problemas',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    clientId: 2,
    vehicleId: 1,
    serviceType: 'Reparación',
    description: 'Reparación de frenos',
    status: 'En Proceso',
    startDate: new Date('2023-03-15'),
    endDate: null,
    estimatedCost: 300000,
    actualCost: null,
    laborHours: 4,
    mechanicId: 3,
    notes: 'Esperando repuestos',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock clients and vehicles
const clients = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@email.com' },
  { id: 2, name: 'María García', email: 'maria.garcia@email.com' }
];

const vehicles = [
  { id: 1, brand: 'Toyota', model: 'Corolla', year: 2023, plate: 'ABC-123' },
  { id: 2, brand: 'Honda', model: 'Civic', year: 2022, plate: 'DEF-456' }
];

// Get all services
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', serviceType = '', clientId = '' } = req.query;
    
    let filteredServices = services;
    
    // Status filter
    if (status) {
      filteredServices = services.filter(service => service.status === status);
    }
    
    // Service type filter
    if (serviceType) {
      filteredServices = filteredServices.filter(service => 
        service.serviceType.toLowerCase() === serviceType.toLowerCase()
      );
    }
    
    // Client filter
    if (clientId) {
      filteredServices = filteredServices.filter(service => 
        service.clientId === parseInt(clientId)
      );
    }
    
    // Add client and vehicle details
    const servicesWithDetails = filteredServices.map(service => {
      const client = clients.find(c => c.id === service.clientId);
      const vehicle = vehicles.find(v => v.id === service.vehicleId);
      
      return {
        ...service,
        client: client || { name: 'Cliente no encontrado' },
        vehicle: vehicle || { brand: 'Vehículo no encontrado' }
      };
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedServices = servicesWithDetails.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedServices,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredServices.length / limit),
        count: filteredServices.length
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener servicios'
    });
  }
});

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
        message: 'No se encontró el servicio con el ID proporcionado'
      });
    }
    
    // Add client and vehicle details
    const client = clients.find(c => c.id === service.clientId);
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    
    const serviceWithDetails = {
      ...service,
      client: client || { name: 'Cliente no encontrado' },
      vehicle: vehicle || { brand: 'Vehículo no encontrado' }
    };
    
    res.json({
      success: true,
      data: serviceWithDetails
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener servicio'
    });
  }
});

// Create new service
router.post('/', [
  body('clientId').isInt({ min: 1 }).withMessage('ID de cliente inválido'),
  body('vehicleId').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
  body('serviceType').notEmpty().withMessage('Tipo de servicio es requerido'),
  body('description').notEmpty().withMessage('Descripción es requerida'),
  body('estimatedCost').isFloat({ min: 0 }).withMessage('Costo estimado debe ser mayor a 0')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const {
      clientId, vehicleId, serviceType, description, estimatedCost,
      laborHours, mechanicId, notes
    } = req.body;
    
    // Validate client exists
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'El cliente especificado no existe'
      });
    }
    
    // Validate vehicle exists
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehículo no encontrado',
        message: 'El vehículo especificado no existe'
      });
    }

    const newService = {
      id: services.length + 1,
      clientId,
      vehicleId,
      serviceType,
      description,
      status: 'Pendiente',
      startDate: new Date(),
      endDate: null,
      estimatedCost,
      actualCost: null,
      laborHours: laborHours || 0,
      mechanicId: mechanicId || 1,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    services.push(newService);

    // Add client and vehicle details to response
    const serviceWithDetails = {
      ...newService,
      client,
      vehicle
    };

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: serviceWithDetails
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear servicio'
    });
  }
});

// Update service
router.put('/:id', [
  body('status').optional().isIn(['Pendiente', 'En Proceso', 'Completado', 'Cancelado']).withMessage('Estado inválido'),
  body('actualCost').optional().isFloat({ min: 0 }).withMessage('Costo real debe ser mayor a 0'),
  body('estimatedCost').optional().isFloat({ min: 0 }).withMessage('Costo estimado debe ser mayor a 0')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const serviceId = parseInt(req.params.id);
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    
    if (serviceIndex === -1) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
        message: 'No se encontró el servicio con el ID proporcionado'
      });
    }

    const updatedService = {
      ...services[serviceIndex],
      ...req.body,
      updatedAt: new Date()
    };

    // If status is completed and no end date, set it
    if (updatedService.status === 'Completado' && !updatedService.endDate) {
      updatedService.endDate = new Date();
    }

    services[serviceIndex] = updatedService;

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: updatedService
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar servicio'
    });
  }
});

// Delete service
router.delete('/:id', (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    
    if (serviceIndex === -1) {
      return res.status(404).json({
        error: 'Servicio no encontrado',
        message: 'No se encontró el servicio con el ID proporcionado'
      });
    }

    const deletedService = services.splice(serviceIndex, 1)[0];

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente',
      data: deletedService
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar servicio'
    });
  }
});

// Get workshop statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalServices = services.length;
    const pendingServices = services.filter(s => s.status === 'Pendiente').length;
    const inProgressServices = services.filter(s => s.status === 'En Proceso').length;
    const completedServices = services.filter(s => s.status === 'Completado').length;
    const cancelledServices = services.filter(s => s.status === 'Cancelado').length;
    
    const totalRevenue = services
      .filter(s => s.status === 'Completado')
      .reduce((sum, s) => sum + (s.actualCost || s.estimatedCost), 0);
    
    const totalEstimatedCost = services.reduce((sum, s) => sum + s.estimatedCost, 0);
    const totalActualCost = services
      .filter(s => s.actualCost)
      .reduce((sum, s) => sum + s.actualCost, 0);
    
    const totalLaborHours = services.reduce((sum, s) => sum + s.laborHours, 0);

    // Service type distribution
    const serviceTypeStats = services.reduce((acc, service) => {
      acc[service.serviceType] = (acc[service.serviceType] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalServices,
        pendingServices,
        inProgressServices,
        completedServices,
        cancelledServices,
        totalRevenue,
        totalEstimatedCost,
        totalActualCost,
        totalLaborHours,
        serviceTypeDistribution: serviceTypeStats
      }
    });
  } catch (error) {
    console.error('Get workshop stats error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener estadísticas del taller'
    });
  }
});

module.exports = router;