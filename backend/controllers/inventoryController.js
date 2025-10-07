import Inventory from '../models/Inventory.js';
import Vehicle from '../models/Vehicle.js';
import logger from '../config/logger.js';

export const createInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    
    logger.info(`Inventory created: ${inventory._id}`);
    res.status(201).json({ success: true, data: inventory, message: 'Inventario creado exitosamente' });
  } catch (error) {
    logger.error('Error creating inventory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const { status, location, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (location) query.location = location;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const inventory = await Inventory.find(query)
      .populate('vehicle', 'brand model year plate vin price')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: inventory,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Error al obtener inventario' });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('vehicle movements.performedBy');
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }
    res.json({ success: true, data: inventory });
  } catch (error) {
    logger.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Error al obtener inventario' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) inventory[key] = req.body[key];
    });

    await inventory.save();
    res.json({ success: true, data: inventory, message: 'Inventario actualizado exitosamente' });
  } catch (error) {
    logger.error('Error updating inventory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    await inventory.softDelete(req.user._id);
    res.json({ success: true, message: 'Inventario eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting inventory:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar inventario' });
  }
};

export const registerEntry = async (req, res) => {
  try {
    const { quantity, reason, reference, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    await inventory.registerEntry(quantity, reason, req.user._id, reference, notes);
    res.json({ success: true, data: inventory, message: 'Entrada registrada exitosamente' });
  } catch (error) {
    logger.error('Error registering entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerExit = async (req, res) => {
  try {
    const { quantity, reason, reference, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    await inventory.registerExit(quantity, reason, req.user._id, reference, notes);
    res.json({ success: true, data: inventory, message: 'Salida registrada exitosamente' });
  } catch (error) {
    logger.error('Error registering exit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const transferLocation = async (req, res) => {
  try {
    const { fromLocation, toLocation, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    await inventory.transfer(fromLocation, toLocation, req.user._id, notes);
    res.json({ success: true, data: inventory, message: 'Transferencia realizada exitosamente' });
  } catch (error) {
    logger.error('Error transferring:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const performAudit = async (req, res) => {
  try {
    const { actualQuantity, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventario no encontrado' });
    }

    await inventory.performAudit(actualQuantity, req.user._id, notes);
    res.json({ success: true, data: inventory, message: 'Auditoría realizada exitosamente' });
  } catch (error) {
    logger.error('Error performing audit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const inventory = await Inventory.findLowStock().populate('vehicle', 'brand model year plate');
    res.json({ success: true, data: inventory, count: inventory.length });
  } catch (error) {
    logger.error('Error fetching low stock:', error);
    res.status(500).json({ success: false, message: 'Error al obtener stock bajo' });
  }
};

export const getNeedingReorder = async (req, res) => {
  try {
    const inventory = await Inventory.findNeedingReorder().populate('vehicle', 'brand model year plate');
    res.json({ success: true, data: inventory, count: inventory.length });
  } catch (error) {
    logger.error('Error fetching needing reorder:', error);
    res.status(500).json({ success: false, message: 'Error al obtener items para reorden' });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const total = await Inventory.countDocuments({ isDeleted: false });
    const inStock = await Inventory.countDocuments({ status: 'in_stock', isDeleted: false });
    const lowStock = await Inventory.countDocuments({ status: 'low_stock', isDeleted: false });
    const outOfStock = await Inventory.countDocuments({ status: 'out_of_stock', isDeleted: false });

    const totalValue = await Inventory.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleData'
        }
      },
      { $unwind: '$vehicleData' },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$vehicleData.price'] } } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalValue[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching inventory stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export default {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  registerEntry,
  registerExit,
  transferLocation,
  performAudit,
  getLowStock,
  getNeedingReorder,
  getInventoryStats
};
