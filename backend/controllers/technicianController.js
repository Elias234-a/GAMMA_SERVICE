import Technician from '../models/Technician.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { createNotification } from '../utils/notifications.js';

/**
 * Crea un nuevo técnico
 * @route POST /api/technicians
 * @access private/admin
 */
export const createTechnician = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si el usuario ya es técnico
    const existingTech = await Technician.findOne({ user: req.body.user });
    if (existingTech) {
      return res.status(400).json({ message: 'Este usuario ya está registrado como técnico' });
    }

    // Verificar que el usuario exista
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar rol del usuario a 'technician' si no lo es
    if (user.role !== 'technician') {
      user.role = 'technician';
      await user.save();
    }

    const technician = new Technician({
      ...req.body,
      status: 'active'
    });

    await technician.save();

    // Notificar al usuario
    await createNotification(
      user._id,
      'info',
      'Registro como Técnico',
      '¡Felicidades! Has sido registrado como técnico en nuestro sistema.',
      { technicianId: technician._id }
    );

    res.status(201).json(technician);

  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todos los técnicos
 * @route GET /api/technicians
 * @access private
 */
export const getTechnicians = async (req, res, next) => {
  try {
    const { status, specialty, available, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Filtros
    if (status) query.status = status;
    if (specialty) query.specialty = { $regex: specialty, $options: 'i' };
    if (available === 'true') query.isAvailable = true;
    
    const technicians = await Technician.find(query)
      .populate('user', 'name email phone')
      .sort({ rating: -1, experience: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Technician.countDocuments(query);
    
    res.json({
      technicians,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTechnicians: count
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un técnico por ID
 * @route GET /api/technicians/:id
 * @access private
 */
export const getTechnicianById = async (req, res, next) => {
  try {
    const technician = await Technician.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedOrders', 'status priority scheduledDate');
    
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }
    
    res.json(technician);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza un técnico
 * @route PUT /api/technicians/:id
 * @access private/admin
 */
export const updateTechnician = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'specialty', 'skills', 'experience', 'status', 
      'workSchedule', 'maxSimultaneousOrders', 'documents'
    ];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Actualización no permitida' });
    }
    
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }
    
    // Actualizar campos
    updates.forEach(update => {
      technician[update] = req.body[update];
    });
    
    await technician.save();
    
    res.json(technician);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza la ubicación del técnico
 * @route PUT /api/technicians/:id/location
 * @access private/technician
 */
export const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Coordenadas inválidas' });
    }
    
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }
    
    // Verificar que el técnico esté actualizando su propia ubicación
    if (technician.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para actualizar esta ubicación' });
    }
    
    technician.currentLocation = {
      type: 'Point',
      coordinates: [coordinates[0], coordinates[1]],
      lastUpdated: new Date()
    };
    
    await technician.save();
    
    res.json({ message: 'Ubicación actualizada correctamente' });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Busca técnicos disponibles cerca de una ubicación
 * @route GET /api/technicians/nearby
 * @access private
 */
export const findNearbyTechnicians = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 10000, specialty } = req.query; // maxDistance en metros
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Se requieren coordenadas de longitud y latitud' });
    }
    
    const query = {
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isAvailable: true,
      status: 'active'
    };
    
    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }
    
    const technicians = await Technician.find(query)
      .populate('user', 'name phone')
      .limit(20);
    
    res.json(technicians);
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene las estadísticas de un técnico
 * @route GET /api/technicians/:id/stats
 * @access private
 */
export const getTechnicianStats = async (req, res, next) => {
  try {
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado' });
    }
    
    // Verificar permisos (solo el propio técnico o admin puede ver sus estadísticas)
    if (req.user.role !== 'admin' && technician.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    // Obtener estadísticas de órdenes
    const orderStats = await Order.aggregate([
      { $match: { technician: technician._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' }
      }}
    ]);
    
    // Calcular disponibilidad
    const availability = {
      isAvailable: technician.isAvailable,
      currentLoad: technician.assignedOrders.length,
      maxLoad: technician.maxSimultaneousOrders,
      loadPercentage: Math.round((technician.assignedOrders.length / technician.maxSimultaneousOrders) * 100)
    };
    
    // Calificar rendimiento (ejemplo simplificado)
    const performance = {
      rating: technician.rating,
      completedJobs: technician.completedJobs,
      efficiency: technician.completedJobs > 0 
        ? Math.min(100, Math.round((technician.completedJobs / (technician.completedJobs + 5)) * 100))
        : 0
    };
    
    res.json({
      technician: {
        id: technician._id,
        name: (await User.findById(technician.user))?.name || 'N/A',
        specialty: technician.specialty,
        experience: technician.experience
      },
      availability,
      performance,
      orderStats,
      lastUpdated: new Date()
    });
    
  } catch (error) {
    next(error);
  }
};
