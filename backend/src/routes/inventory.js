import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock inventory database
let inventory = [
  {
    id: 1,
    name: 'Aceite Motor 5W-30',
    category: 'Lubricantes',
    sku: 'ACE-5W30-001',
    quantity: 50,
    minQuantity: 10,
    unitPrice: 45000,
    supplier: 'Lubricantes Colombia',
    location: 'Almacén A',
    description: 'Aceite sintético para motor',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Filtro de Aire',
    category: 'Filtros',
    sku: 'FIL-AIR-001',
    quantity: 25,
    minQuantity: 5,
    unitPrice: 25000,
    supplier: 'Filtros del Norte',
    location: 'Almacén B',
    description: 'Filtro de aire para vehículos',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all inventory items
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', lowStock = false } = req.query;
    
    let filteredInventory = inventory;
    
    if (search) {
      filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredInventory = filteredInventory.filter(item => item.category === category);
    }
    
    if (lowStock === 'true') {
      filteredInventory = filteredInventory.filter(item => item.quantity <= item.minQuantity);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedInventory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredInventory.length / limit),
        totalItems: filteredInventory.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch inventory'
    });
  }
});

// Get inventory item by ID
router.get('/:id', (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = inventory.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({
        error: 'Inventory item not found',
        message: `Inventory item with ID ${itemId} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch inventory item'
    });
  }
});

// Create new inventory item
router.post('/', [
  body('name').isLength({ min: 2 }).trim(),
  body('category').isLength({ min: 2 }).trim(),
  body('sku').isLength({ min: 3 }).trim(),
  body('quantity').isInt({ min: 0 }),
  body('minQuantity').isInt({ min: 0 }),
  body('unitPrice').isFloat({ min: 0 }),
  body('supplier').isLength({ min: 2 }).trim()
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
      name, category, sku, quantity, minQuantity, unitPrice,
      supplier, location, description
    } = req.body;
    
    // Check if SKU already exists
    const existingItem = inventory.find(i => i.sku === sku);
    if (existingItem) {
      return res.status(409).json({
        error: 'SKU already exists',
        message: 'An inventory item with this SKU already exists'
      });
    }
    
    const newItem = {
      id: inventory.length + 1,
      name,
      category,
      sku,
      quantity,
      minQuantity,
      unitPrice,
      supplier,
      location: location || '',
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    inventory.push(newItem);
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create inventory item'
    });
  }
});

// Update inventory item
router.put('/:id', [
  body('name').optional().isLength({ min: 2 }).trim(),
  body('category').optional().isLength({ min: 2 }).trim(),
  body('sku').optional().isLength({ min: 3 }).trim(),
  body('quantity').optional().isInt({ min: 0 }),
  body('minQuantity').optional().isInt({ min: 0 }),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('supplier').optional().isLength({ min: 2 }).trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const itemId = parseInt(req.params.id);
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Inventory item not found',
        message: `Inventory item with ID ${itemId} does not exist`
      });
    }
    
    const updatedItem = {
      ...inventory[itemIndex],
      ...req.body,
      id: itemId,
      updatedAt: new Date()
    };
    
    inventory[itemIndex] = updatedItem;
    
    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update inventory item'
    });
  }
});

// Delete inventory item
router.delete('/:id', (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Inventory item not found',
        message: `Inventory item with ID ${itemId} does not exist`
      });
    }
    
    inventory.splice(itemIndex, 1);
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete inventory item'
    });
  }
});

export default router;