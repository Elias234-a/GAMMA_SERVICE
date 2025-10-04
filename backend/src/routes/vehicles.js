const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock vehicles database
let vehicles = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'Blanco',
    plate: 'ABC-123',
    vin: '1HGBH41JXMN109186',
    engineNumber: 'ENG001',
    mileage: 15000,
    fuelType: 'Gasolina',
    transmission: 'Automática',
    status: 'Disponible',
    price: 85000000,
    cost: 75000000,
    clientId: null,
    purchaseDate: new Date('2023-01-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    color: 'Negro',
    plate: 'DEF-456',
    vin: '2HGBH41JXMN109187',
    engineNumber: 'ENG002',
    mileage: 25000,
    fuelType: 'Gasolina',
    transmission: 'Manual',
    status: 'Vendido',
    price: 95000000,
    cost: 85000000,
    clientId: 1,
    purchaseDate: new Date('2022-06-10'),
    saleDate: new Date('2023-03-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all vehicles
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', brand = '' } = req.query;
    
    let filteredVehicles = vehicles;
    
    // Search filter
    if (search) {
      filteredVehicles = vehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Status filter
    if (status) {
      filteredVehicles = filteredVehicles.filter(vehicle => vehicle.status === status);
    }
    
    // Brand filter
    if (brand) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedVehicles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(filteredVehicles.length / limit),
        count: filteredVehicles.length
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener vehículos'
    });
  }
});

// Get vehicle by ID
router.get('/:id', (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehículo no encontrado',
        message: 'No se encontró el vehículo con el ID proporcionado'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener vehículo'
    });
  }
});

// Create new vehicle
router.post('/', [
  body('brand').notEmpty().withMessage('Marca es requerida'),
  body('model').notEmpty().withMessage('Modelo es requerido'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('color').notEmpty().withMessage('Color es requerido'),
  body('plate').notEmpty().withMessage('Placa es requerida'),
  body('vin').notEmpty().withMessage('VIN es requerido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('cost').isFloat({ min: 0 }).withMessage('Costo debe ser mayor a 0')
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
      brand, model, year, color, plate, vin, engineNumber,
      mileage, fuelType, transmission, price, cost, purchaseDate
    } = req.body;
    
    // Check if vehicle already exists
    const existingVehicle = vehicles.find(v => 
      v.plate === plate || v.vin === vin
    );
    
    if (existingVehicle) {
      return res.status(409).json({
        error: 'Vehículo ya existe',
        message: 'Ya existe un vehículo con esta placa o VIN'
      });
    }

    const newVehicle = {
      id: vehicles.length + 1,
      brand,
      model,
      year,
      color,
      plate,
      vin,
      engineNumber: engineNumber || '',
      mileage: mileage || 0,
      fuelType: fuelType || 'Gasolina',
      transmission: transmission || 'Manual',
      status: 'Disponible',
      price,
      cost,
      clientId: null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vehicles.push(newVehicle);

    res.status(201).json({
      success: true,
      message: 'Vehículo creado exitosamente',
      data: newVehicle
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear vehículo'
    });
  }
});

// Update vehicle
router.put('/:id', [
  body('brand').optional().notEmpty().withMessage('Marca no puede estar vacía'),
  body('model').optional().notEmpty().withMessage('Modelo no puede estar vacío'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Costo debe ser mayor a 0')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const vehicleId = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        error: 'Vehículo no encontrado',
        message: 'No se encontró el vehículo con el ID proporcionado'
      });
    }

    const updatedVehicle = {
      ...vehicles[vehicleIndex],
      ...req.body,
      updatedAt: new Date()
    };

    vehicles[vehicleIndex] = updatedVehicle;

    res.json({
      success: true,
      message: 'Vehículo actualizado exitosamente',
      data: updatedVehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar vehículo'
    });
  }
});

// Delete vehicle
router.delete('/:id', (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        error: 'Vehículo no encontrado',
        message: 'No se encontró el vehículo con el ID proporcionado'
      });
    }

    const vehicle = vehicles[vehicleIndex];
    
    // Check if vehicle is sold
    if (vehicle.status === 'Vendido') {
      return res.status(400).json({
        error: 'No se puede eliminar',
        message: 'No se puede eliminar un vehículo vendido'
      });
    }

    const deletedVehicle = vehicles.splice(vehicleIndex, 1)[0];

    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente',
      data: deletedVehicle
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar vehículo'
    });
  }
});

// Get vehicle statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Disponible').length;
    const soldVehicles = vehicles.filter(v => v.status === 'Vendido').length;
    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
    const totalCost = vehicles.reduce((sum, v) => sum + v.cost, 0);
    const totalProfit = totalValue - totalCost;

    // Brand distribution
    const brandStats = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.brand] = (acc[vehicle.brand] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalVehicles,
        availableVehicles,
        soldVehicles,
        totalValue,
        totalCost,
        totalProfit,
        brandDistribution: brandStats
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener estadísticas de vehículos'
    });
  }
});

module.exports = router;