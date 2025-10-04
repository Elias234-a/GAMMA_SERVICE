import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock vehicles database
let vehicles = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2024,
    color: 'Blanco',
    vin: '1HGBH41JXMN109186',
    plate: 'ABC123',
    engineNumber: 'ENG001',
    mileage: 0,
    price: 85000000,
    cost: 70000000,
    status: 'Disponible',
    fuelType: 'Gasolina',
    transmission: 'Automática',
    engineSize: '1.8L',
    doors: 4,
    seats: 5,
    description: 'Toyota Corolla 2024 en excelente estado',
    images: ['https://example.com/corolla1.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Negro',
    vin: '2HGBH41JXMN109187',
    plate: 'DEF456',
    engineNumber: 'ENG002',
    mileage: 15000,
    price: 78000000,
    cost: 65000000,
    status: 'Vendido',
    fuelType: 'Gasolina',
    transmission: 'Manual',
    engineSize: '1.5L',
    doors: 4,
    seats: 5,
    description: 'Honda Civic 2023 con 15,000 km',
    images: ['https://example.com/civic1.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all vehicles
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', brand = '' } = req.query;
    
    let filteredVehicles = vehicles;
    
    if (search) {
      filteredVehicles = vehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredVehicles = filteredVehicles.filter(vehicle => vehicle.status === status);
    }
    
    if (brand) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedVehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredVehicles.length / limit),
        totalItems: filteredVehicles.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vehicles'
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
        error: 'Vehicle not found',
        message: `Vehicle with ID ${vehicleId} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vehicle'
    });
  }
});

// Create new vehicle
router.post('/', [
  body('brand').isLength({ min: 2 }).trim(),
  body('model').isLength({ min: 2 }).trim(),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('color').isLength({ min: 2 }).trim(),
  body('vin').isLength({ min: 17, max: 17 }),
  body('price').isFloat({ min: 0 }),
  body('cost').isFloat({ min: 0 }),
  body('status').isIn(['Disponible', 'Vendido', 'Reservado', 'En Reparación'])
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
      brand, model, year, color, vin, plate, engineNumber, mileage,
      price, cost, status, fuelType, transmission, engineSize,
      doors, seats, description, images
    } = req.body;
    
    // Check if vehicle already exists
    const existingVehicle = vehicles.find(v => v.vin === vin || v.plate === plate);
    if (existingVehicle) {
      return res.status(409).json({
        error: 'Vehicle already exists',
        message: 'A vehicle with this VIN or plate already exists'
      });
    }
    
    const newVehicle = {
      id: vehicles.length + 1,
      brand,
      model,
      year,
      color,
      vin,
      plate: plate || '',
      engineNumber: engineNumber || '',
      mileage: mileage || 0,
      price,
      cost,
      status: status || 'Disponible',
      fuelType: fuelType || 'Gasolina',
      transmission: transmission || 'Manual',
      engineSize: engineSize || '',
      doors: doors || 4,
      seats: seats || 5,
      description: description || '',
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    vehicles.push(newVehicle);
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: newVehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create vehicle'
    });
  }
});

// Update vehicle
router.put('/:id', [
  body('brand').optional().isLength({ min: 2 }).trim(),
  body('model').optional().isLength({ min: 2 }).trim(),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('color').optional().isLength({ min: 2 }).trim(),
  body('vin').optional().isLength({ min: 17, max: 17 }),
  body('price').optional().isFloat({ min: 0 }),
  body('cost').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['Disponible', 'Vendido', 'Reservado', 'En Reparación'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const vehicleId = parseInt(req.params.id);
    const vehicleIndex = vehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `Vehicle with ID ${vehicleId} does not exist`
      });
    }
    
    const updatedVehicle = {
      ...vehicles[vehicleIndex],
      ...req.body,
      id: vehicleId,
      updatedAt: new Date()
    };
    
    vehicles[vehicleIndex] = updatedVehicle;
    
    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update vehicle'
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
        error: 'Vehicle not found',
        message: `Vehicle with ID ${vehicleId} does not exist`
      });
    }
    
    vehicles.splice(vehicleIndex, 1);
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete vehicle'
    });
  }
});

export default router;