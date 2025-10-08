import Vehicle from '../models/Vehicle.js';
import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';

/**
 * Crear un nuevo vehículo
 * @route POST /api/vehicles
 */
export const createVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      createdBy: req.user._id
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Crear registro de inventario automáticamente
    const inventory = new Inventory({
      vehicle: vehicle._id,
      location: vehicleData.location || 'warehouse',
      quantity: 1,
      status: 'in_stock',
      purchasePrice: vehicle.cost,
      purchaseDate: vehicle.purchaseDate || new Date(),
      supplier: vehicle.supplier ? { name: vehicle.supplier } : undefined
    });
    await inventory.save();

    logger.info(`Vehicle created: ${vehicle._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehículo creado exitosamente'
    });
  } catch (error) {
    logger.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear el vehículo'
    });
  }
};

/**
 * Obtener todos los vehículos con filtros
 * @route GET /api/vehicles
 */
export const getVehicles = async (req, res) => {
  try {
    const {
      status,
      category,
      brand,
      minPrice,
      maxPrice,
      year,
      type,
      color,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    // Aplicar filtros
    if (status) query.status = status;
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (type) query.type = type;
    if (color) query.color = new RegExp(color, 'i');
    if (year) query.year = parseInt(year);
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Búsqueda general usando índice de texto (OPTIMIZACIÓN)
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // OPTIMIZACIÓN: Solo seleccionar campos necesarios y usar .lean()
    const vehicles = await Vehicle.find(query)
      .select('brand model year plate vin color price cost status category type mileage transmission fuel images currentOwner location createdAt')
      .populate('currentOwner', 'firstName lastName email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Retorna objetos JS planos, 40-60% más rápido

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos'
    });
  }
};

/**
 * Obtener vehículo por ID
 * @route GET /api/vehicles/:id
 */
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentOwner', 'firstName lastName email phone')
      .populate('notes.createdBy', 'name email');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Obtener inventario asociado
    const inventory = await Inventory.findOne({ vehicle: vehicle._id });

    res.json({
      success: true,
      data: {
        ...vehicle.toObject(),
        inventory
      }
    });
  } catch (error) {
    logger.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el vehículo'
    });
  }
};

/**
 * Actualizar vehículo
 * @route PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        vehicle[key] = req.body[key];
      }
    });

    await vehicle.save();

    logger.info(`Vehicle updated: ${vehicle._id} by user ${req.user._id}`);

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehículo actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar el vehículo'
    });
  }
};

/**
 * Eliminar vehículo (soft delete)
 * @route DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    await vehicle.softDelete(req.user._id);

    // Actualizar inventario
    const inventory = await Inventory.findOne({ vehicle: vehicle._id });
    if (inventory) {
      await inventory.softDelete(req.user._id);
    }

    logger.info(`Vehicle deleted: ${vehicle._id} by user ${req.user._id}`);

    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el vehículo'
    });
  }
};

/**
 * Obtener vehículos disponibles
 * @route GET /api/vehicles/available
 */
export const getAvailableVehicles = async (req, res) => {
  try {
    // OPTIMIZACIÓN: Usar .lean() y .select() para mejorar rendimiento
    const vehicles = await Vehicle.findAvailable()
      .select('brand model year plate price color status category images')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    logger.error('Error fetching available vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vehículos disponibles'
    });
  }
};

/**
 * Marcar vehículo como vendido
 * @route PATCH /api/vehicles/:id/sold
 */
export const markAsSold = async (req, res) => {
  try {
    const { clientId } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    await vehicle.markAsSold(clientId);

    // Actualizar inventario
    const inventory = await Inventory.findOne({ vehicle: vehicle._id });
    if (inventory) {
      inventory.status = 'sold';
      inventory.location = 'sold';
      await inventory.registerExit(1, 'Venta', req.user._id, null, `Vendido a cliente ${clientId}`);
    }

    logger.info(`Vehicle marked as sold: ${vehicle._id}`);

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehículo marcado como vendido'
    });
  } catch (error) {
    logger.error('Error marking vehicle as sold:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar vehículo como vendido'
    });
  }
};

/**
 * Subir imágenes del vehículo
 * @route POST /api/vehicles/:id/images
 */
export const uploadImages = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    const { images } = req.body; // Array de { url, isPrimary }

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de imágenes'
      });
    }

    images.forEach(img => {
      vehicle.images.push({
        url: img.url,
        isPrimary: img.isPrimary || false
      });
    });

    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
      message: 'Imágenes subidas exitosamente'
    });
  } catch (error) {
    logger.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes'
    });
  }
};

/**
 * Agregar nota al vehículo
 * @route POST /api/vehicles/:id/notes
 */
export const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    vehicle.notes.push({
      content,
      createdBy: req.user._id
    });

    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
      message: 'Nota agregada exitosamente'
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar nota'
    });
  }
};

/**
 * Estadísticas de vehículos
 * @route GET /api/vehicles/stats
 */
export const getVehicleStats = async (req, res) => {
  try {
    // OPTIMIZACIÓN: Usar agregación $facet para reducir múltiples queries a una
    const stats = await Vehicle.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          totalValue: [
            { $match: { status: 'available' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byBrand: [
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const { counts, totalValue, byCategory, byBrand } = stats[0];
    
    // Parsear counts por status
    const statusCounts = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: counts.reduce((sum, item) => sum + item.count, 0),
        available: statusCounts.available || 0,
        sold: statusCounts.sold || 0,
        reserved: statusCounts.reserved || 0,
        inService: statusCounts.in_service || 0,
        totalInventoryValue: totalValue[0]?.total || 0,
        byCategory,
        byBrand
      }
    });
  } catch (error) {
    logger.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

export default {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  markAsSold,
  uploadImages,
  addNote,
  getVehicleStats
};
