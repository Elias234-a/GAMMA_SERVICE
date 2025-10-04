import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock sales database
let sales = [
  {
    id: 1,
    clientId: 1,
    vehicleId: 2,
    clientName: 'Juan Pérez',
    vehicleInfo: 'Honda Civic 2023',
    salePrice: 78000000,
    downPayment: 15000000,
    financingAmount: 63000000,
    financingTerm: 60,
    monthlyPayment: 1050000,
    saleDate: new Date('2024-01-15'),
    status: 'Completada',
    salesperson: 'Vendedor',
    notes: 'Venta con financiación bancaria',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all sales
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', startDate = '', endDate = '' } = req.query;
    
    let filteredSales = sales;
    
    if (status) {
      filteredSales = sales.filter(sale => sale.status === status);
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= start && saleDate <= end;
      });
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSales = filteredSales.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedSales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredSales.length / limit),
        totalItems: filteredSales.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch sales'
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
        error: 'Sale not found',
        message: `Sale with ID ${saleId} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch sale'
    });
  }
});

// Create new sale
router.post('/', [
  body('clientId').isInt({ min: 1 }),
  body('vehicleId').isInt({ min: 1 }),
  body('salePrice').isFloat({ min: 0 }),
  body('downPayment').isFloat({ min: 0 }),
  body('financingAmount').isFloat({ min: 0 }),
  body('financingTerm').isInt({ min: 1 }),
  body('monthlyPayment').isFloat({ min: 0 }),
  body('saleDate').isISO8601(),
  body('status').isIn(['Pendiente', 'Completada', 'Cancelada'])
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
      clientId, vehicleId, salePrice, downPayment, financingAmount,
      financingTerm, monthlyPayment, saleDate, status, salesperson, notes
    } = req.body;
    
    const newSale = {
      id: sales.length + 1,
      clientId,
      vehicleId,
      clientName: 'Cliente', // En producción se obtendría de la base de datos
      vehicleInfo: 'Vehículo', // En producción se obtendría de la base de datos
      salePrice,
      downPayment,
      financingAmount,
      financingTerm,
      monthlyPayment,
      saleDate: new Date(saleDate),
      status: status || 'Pendiente',
      salesperson: salesperson || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    sales.push(newSale);
    
    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: newSale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create sale'
    });
  }
});

// Update sale
router.put('/:id', [
  body('salePrice').optional().isFloat({ min: 0 }),
  body('downPayment').optional().isFloat({ min: 0 }),
  body('financingAmount').optional().isFloat({ min: 0 }),
  body('financingTerm').optional().isInt({ min: 1 }),
  body('monthlyPayment').optional().isFloat({ min: 0 }),
  body('saleDate').optional().isISO8601(),
  body('status').optional().isIn(['Pendiente', 'Completada', 'Cancelada'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const saleId = parseInt(req.params.id);
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) {
      return res.status(404).json({
        error: 'Sale not found',
        message: `Sale with ID ${saleId} does not exist`
      });
    }
    
    const updatedSale = {
      ...sales[saleIndex],
      ...req.body,
      id: saleId,
      updatedAt: new Date()
    };
    
    sales[saleIndex] = updatedSale;
    
    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update sale'
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
        error: 'Sale not found',
        message: `Sale with ID ${saleId} does not exist`
      });
    }
    
    sales.splice(saleIndex, 1);
    
    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete sale'
    });
  }
});

export default router;