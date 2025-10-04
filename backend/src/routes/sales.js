const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock sales database
let sales = [
  {
    id: 1,
    clientId: 1,
    vehicleId: 2,
    saleDate: new Date('2023-03-15'),
    price: 95000000,
    downPayment: 20000000,
    financingAmount: 75000000,
    financingTerm: 60,
    monthlyPayment: 1250000,
    status: 'Completada',
    paymentMethod: 'Financiado',
    salespersonId: 2,
    notes: 'Venta con financiación bancaria',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock clients and vehicles (en producción vendrían de sus respectivas APIs)
const clients = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@email.com' },
  { id: 2, name: 'María García', email: 'maria.garcia@email.com' }
];

const vehicles = [
  { id: 1, brand: 'Toyota', model: 'Corolla', year: 2023, plate: 'ABC-123' },
  { id: 2, brand: 'Honda', model: 'Civic', year: 2022, plate: 'DEF-456' }
];

// Get all sales
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', clientId = '', vehicleId = '' } = req.query;
    
    let filteredSales = sales;
    
    // Status filter
    if (status) {
      filteredSales = sales.filter(sale => sale.status === status);
    }
    
    // Client filter
    if (clientId) {
      filteredSales = filteredSales.filter(sale => sale.clientId === parseInt(clientId));
    }
    
    // Vehicle filter
    if (vehicleId) {
      filteredSales = filteredSales.filter(sale => sale.vehicleId === parseInt(vehicleId));
    }
    
    // Add client and vehicle details
    const salesWithDetails = filteredSales.map(sale => {
      const client = clients.find(c => c.id === sale.clientId);
      const vehicle = vehicles.find(v => v.id === sale.vehicleId);
      
      return {
        ...sale,
        client: client || { name: 'Cliente no encontrado' },
        vehicle: vehicle || { brand: 'Vehículo no encontrado' }
      };
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSales = salesWithDetails.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedSales,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredSales.length / limit),
        count: filteredSales.length
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener ventas'
    });
  }
});

// Get sale by ID
router.get('/:id', (req, res) => {
  try {
    const saleId = parseInt(req.params.id);
    const sale = sales.find(s => s.id === saleId);
    
    if (!sale) {
      return res.status(404).json({
        error: 'Venta no encontrada',
        message: 'No se encontró la venta con el ID proporcionado'
      });
    }
    
    // Add client and vehicle details
    const client = clients.find(c => c.id === sale.clientId);
    const vehicle = vehicles.find(v => v.id === sale.vehicleId);
    
    const saleWithDetails = {
      ...sale,
      client: client || { name: 'Cliente no encontrado' },
      vehicle: vehicle || { brand: 'Vehículo no encontrado' }
    };
    
    res.json({
      success: true,
      data: saleWithDetails
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener venta'
    });
  }
});

// Create new sale
router.post('/', [
  body('clientId').isInt({ min: 1 }).withMessage('ID de cliente inválido'),
  body('vehicleId').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('downPayment').isFloat({ min: 0 }).withMessage('Enganche debe ser mayor o igual a 0'),
  body('paymentMethod').notEmpty().withMessage('Método de pago es requerido')
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
      clientId, vehicleId, price, downPayment, financingAmount,
      financingTerm, monthlyPayment, paymentMethod, notes, salespersonId
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

    const newSale = {
      id: sales.length + 1,
      clientId,
      vehicleId,
      saleDate: new Date(),
      price,
      downPayment: downPayment || 0,
      financingAmount: financingAmount || (price - (downPayment || 0)),
      financingTerm: financingTerm || 0,
      monthlyPayment: monthlyPayment || 0,
      status: 'Completada',
      paymentMethod,
      salespersonId: salespersonId || 1,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sales.push(newSale);

    // Add client and vehicle details to response
    const saleWithDetails = {
      ...newSale,
      client,
      vehicle
    };

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: saleWithDetails
    });

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear venta'
    });
  }
});

// Update sale
router.put('/:id', [
  body('price').optional().isFloat({ min: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('downPayment').optional().isFloat({ min: 0 }).withMessage('Enganche debe ser mayor o igual a 0'),
  body('status').optional().isIn(['Pendiente', 'Completada', 'Cancelada']).withMessage('Estado inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const saleId = parseInt(req.params.id);
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) {
      return res.status(404).json({
        error: 'Venta no encontrada',
        message: 'No se encontró la venta con el ID proporcionado'
      });
    }

    const updatedSale = {
      ...sales[saleIndex],
      ...req.body,
      updatedAt: new Date()
    };

    sales[saleIndex] = updatedSale;

    res.json({
      success: true,
      message: 'Venta actualizada exitosamente',
      data: updatedSale
    });

  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar venta'
    });
  }
});

// Delete sale
router.delete('/:id', (req, res) => {
  try {
    const saleId = parseInt(req.params.id);
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) {
      return res.status(404).json({
        error: 'Venta no encontrada',
        message: 'No se encontró la venta con el ID proporcionado'
      });
    }

    const deletedSale = sales.splice(saleIndex, 1)[0];

    res.json({
      success: true,
      message: 'Venta eliminada exitosamente',
      data: deletedSale
    });

  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar venta'
    });
  }
});

// Get sales statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalSales = sales.length;
    const completedSales = sales.filter(s => s.status === 'Completada').length;
    const pendingSales = sales.filter(s => s.status === 'Pendiente').length;
    const cancelledSales = sales.filter(s => s.status === 'Cancelada').length;
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);
    const totalDownPayments = sales.reduce((sum, s) => sum + s.downPayment, 0);
    const totalFinancing = sales.reduce((sum, s) => sum + s.financingAmount, 0);
    
    // Monthly sales
    const monthlySales = sales.reduce((acc, sale) => {
      const month = sale.saleDate.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalSales,
        completedSales,
        pendingSales,
        cancelledSales,
        totalRevenue,
        totalDownPayments,
        totalFinancing,
        monthlySales
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener estadísticas de ventas'
    });
  }
});

module.exports = router;