import Service from '../models/Service.js';
import Vehicle from '../models/Vehicle.js';
import Client from '../models/Client.js';
import Technician from '../models/Technician.js';
import Invoice from '../models/Invoice.js';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';

export const createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Validar cliente y vehículo
    const client = await Client.findById(serviceData.client);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    const vehicle = await Vehicle.findById(serviceData.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }

    const service = new Service(serviceData);
    await service.save();

    // Notificar al cliente
    await createNotification(
      client.user || client._id,
      'info',
      'Servicio Programado',
      `Su servicio #${service.serviceNumber} ha sido programado para el ${new Date(service.scheduledDate).toLocaleDateString()}`,
      { serviceId: service._id }
    );

    logger.info(`Service created: ${service._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: service,
      message: 'Servicio creado exitosamente'
    });
  } catch (error) {
    logger.error('Error creating service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const {
      status,
      client,
      vehicle,
      technician,
      serviceType,
      priority,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'scheduledDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (status) query.status = status;
    if (client) query.client = client;
    if (vehicle) query.vehicle = vehicle;
    if (technician) query.technician = technician;
    if (serviceType) query.serviceType = serviceType;
    if (priority) query.priority = priority;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { serviceNumber: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const services = await Service.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year plate')
      .populate('technician', 'name email specialties')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error al obtener servicios' });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('client', 'firstName lastName email phone address')
      .populate('vehicle', 'brand model year plate vin mileage')
      .populate('technician', 'name email specialties')
      .populate('assignedTo', 'name email')
      .populate('invoice')
      .populate('notes.createdBy', 'name')
      .populate('parts.technician', 'name')
      .populate('labor.technician', 'name');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    res.json({ success: true, data: service });
  } catch (error) {
    logger.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el servicio' });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) service[key] = req.body[key];
    });

    // Recalcular costos si cambió algo
    if (req.body.parts || req.body.labor || req.body.additionalCharges || req.body.discount || req.body.taxes) {
      service.calculateCosts();
    }

    await service.save();
    logger.info(`Service updated: ${service._id}`);

    res.json({ success: true, data: service, message: 'Servicio actualizado exitosamente' });
  } catch (error) {
    logger.error('Error updating service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    await service.softDelete(req.user._id);
    logger.info(`Service deleted: ${service._id}`);

    res.json({ success: true, message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el servicio' });
  }
};

export const startService = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Validar técnico si se proporciona
    if (technicianId) {
      const technician = await Technician.findById(technicianId);
      if (!technician) {
        return res.status(404).json({ success: false, message: 'Técnico no encontrado' });
      }
    }

    await service.start(technicianId, req.user._id);

    // Notificar al cliente
    await createNotification(
      service.client,
      'info',
      'Servicio Iniciado',
      `El servicio #${service.serviceNumber} ha sido iniciado`,
      { serviceId: service._id }
    );

    logger.info(`Service started: ${service._id}`);
    res.json({ success: true, data: service, message: 'Servicio iniciado exitosamente' });
  } catch (error) {
    logger.error('Error starting service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    await service.complete(req.user._id);

    // Notificar al cliente
    await createNotification(
      service.client,
      'success',
      'Servicio Completado',
      `El servicio #${service.serviceNumber} ha sido completado`,
      { serviceId: service._id }
    );

    logger.info(`Service completed: ${service._id}`);
    res.json({ success: true, data: service, message: 'Servicio completado exitosamente' });
  } catch (error) {
    logger.error('Error completing service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelService = async (req, res) => {
  try {
    const { reason } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    await service.cancel(reason, req.user._id);

    // Notificar al cliente
    await createNotification(
      service.client,
      'warning',
      'Servicio Cancelado',
      `El servicio #${service.serviceNumber} ha sido cancelado`,
      { serviceId: service._id }
    );

    logger.info(`Service cancelled: ${service._id}`);
    res.json({ success: true, data: service, message: 'Servicio cancelado exitosamente' });
  } catch (error) {
    logger.error('Error cancelling service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestApproval = async (req, res) => {
  try {
    const { estimatedCost } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    await service.requestApproval(estimatedCost, req.user._id);

    // Notificar al cliente
    await createNotification(
      service.client,
      'warning',
      'Aprobación Requerida',
      `El servicio #${service.serviceNumber} requiere aprobación. Costo estimado: $${estimatedCost.toLocaleString()}`,
      { serviceId: service._id }
    );

    logger.info(`Approval requested for service: ${service._id}`);
    res.json({ success: true, data: service, message: 'Aprobación solicitada exitosamente' });
  } catch (error) {
    logger.error('Error requesting approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    await service.approve(req.user.name || req.user.email);
    logger.info(`Service approved: ${service._id}`);

    res.json({ success: true, data: service, message: 'Servicio aprobado exitosamente' });
  } catch (error) {
    logger.error('Error approving service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { isDeleted: false };

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const total = await Service.countDocuments(query);
    const scheduled = await Service.countDocuments({ ...query, status: 'scheduled' });
    const inProgress = await Service.countDocuments({ ...query, status: 'in_progress' });
    const completed = await Service.countDocuments({ ...query, status: 'completed' });
    const cancelled = await Service.countDocuments({ ...query, status: 'cancelled' });

    const revenue = await Service.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const byType = await Service.aggregate([
      { $match: query },
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);

    const byTechnician = await Service.aggregate([
      { $match: query },
      { $group: { _id: '$technician', count: { $sum: 1 }, revenue: { $sum: '$totalCost' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        inProgress,
        completed,
        cancelled,
        totalRevenue: revenue[0]?.total || 0,
        averageCost: completed > 0 ? (revenue[0]?.total || 0) / completed : 0,
        byType,
        byTechnician
      }
    });
  } catch (error) {
    logger.error('Error fetching service stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export const getServicesByTechnician = async (req, res) => {
  try {
    const services = await Service.find({
      technician: req.params.technicianId,
      isDeleted: false
    })
      .populate('vehicle', 'brand model year plate')
      .populate('client', 'firstName lastName')
      .sort({ scheduledDate: -1 })
      .limit(50);

    res.json({ success: true, data: services, count: services.length });
  } catch (error) {
    logger.error('Error fetching services by technician:', error);
    res.status(500).json({ success: false, message: 'Error al obtener servicios del técnico' });
  }
};

export default {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  startService,
  completeService,
  cancelService,
  requestApproval,
  approveService,
  getServiceStats,
  getServicesByTechnician
};
