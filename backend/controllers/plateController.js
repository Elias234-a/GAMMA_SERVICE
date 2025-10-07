import PlateRequest from '../models/PlateRequest.js';
import Client from '../models/Client.js';
import Vehicle from '../models/Vehicle.js';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';

export const createPlateRequest = async (req, res) => {
  try {
    const requestData = { ...req.body, processedBy: req.user._id };
    const plateRequest = new PlateRequest(requestData);
    
    plateRequest.calculateTotalFees();
    
    await plateRequest.save();
    
    logger.info(`Plate request created: ${plateRequest._id}`);
    res.status(201).json({ success: true, data: plateRequest, message: 'Solicitud de placa creada exitosamente' });
  } catch (error) {
    logger.error('Error creating plate request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlateRequests = async (req, res) => {
  try {
    const { status, client, vehicle, requestType, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (client) query.client = client;
    if (vehicle) query.vehicle = vehicle;
    if (requestType) query.requestType = requestType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await PlateRequest.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year vin')
      .populate('sale', 'saleNumber')
      .populate('processedBy', 'name email')
      .sort({ requestDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PlateRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching plate requests:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
  }
};

export const getPlateRequestById = async (req, res) => {
  try {
    const request = await PlateRequest.findById(req.params.id)
      .populate('client')
      .populate('vehicle')
      .populate('sale')
      .populate('processedBy', 'name email')
      .populate('timeline.updatedBy', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    logger.error('Error fetching plate request:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitud' });
  }
};

export const updatePlateRequest = async (req, res) => {
  try {
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) request[key] = req.body[key];
    });

    if (req.body.fees) {
      request.calculateTotalFees();
    }

    await request.save();
    res.json({ success: true, data: request, message: 'Solicitud actualizada exitosamente' });
  } catch (error) {
    logger.error('Error updating plate request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlateRequest = async (req, res) => {
  try {
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await request.softDelete(req.user._id);
    res.json({ success: true, message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    logger.error('Error deleting plate request:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar solicitud' });
  }
};

export const submitToTransito = async (req, res) => {
  try {
    const { referenceNumber } = req.body;
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await request.submitToTransito(referenceNumber, req.user._id);

    await createNotification(
      request.client,
      'info',
      'Trámite Enviado a Tránsito',
      `Su trámite de placa #${request.requestNumber} ha sido enviado a tránsito`,
      { plateRequestId: request._id }
    );

    logger.info(`Plate request submitted to transito: ${request._id}`);
    res.json({ success: true, data: request, message: 'Trámite enviado a tránsito exitosamente' });
  } catch (error) {
    logger.error('Error submitting to transito:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsReady = async (req, res) => {
  try {
    const { plateNumber } = req.body;
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await request.markAsReady(plateNumber, req.user._id);

    // Actualizar placa del vehículo
    const vehicle = await Vehicle.findById(request.vehicle);
    if (vehicle) {
      vehicle.plate = plateNumber;
      await vehicle.save();
    }

    await createNotification(
      request.client,
      'success',
      'Placa Lista',
      `Su placa ${plateNumber} está lista para recoger`,
      { plateRequestId: request._id }
    );

    logger.info(`Plate marked as ready: ${request._id}`);
    res.json({ success: true, data: request, message: 'Placa marcada como lista' });
  } catch (error) {
    logger.error('Error marking as ready:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deliverPlate = async (req, res) => {
  try {
    const { deliveredTo, receivedBy } = req.body;
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await request.deliver(deliveredTo, receivedBy, req.user._id);

    await createNotification(
      request.client,
      'success',
      'Placa Entregada',
      `Su placa ${request.newPlate} ha sido entregada exitosamente`,
      { plateRequestId: request._id }
    );

    logger.info(`Plate delivered: ${request._id}`);
    res.json({ success: true, data: request, message: 'Placa entregada exitosamente' });
  } catch (error) {
    logger.error('Error delivering plate:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelPlateRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await PlateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await request.cancel(reason, req.user._id);
    logger.info(`Plate request cancelled: ${request._id}`);
    res.json({ success: true, data: request, message: 'Trámite cancelado exitosamente' });
  } catch (error) {
    logger.error('Error cancelling plate request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingPlateRequests = async (req, res) => {
  try {
    const requests = await PlateRequest.findPending()
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year vin')
      .sort({ requestDate: 1 });

    res.json({ success: true, data: requests, count: requests.length });
  } catch (error) {
    logger.error('Error fetching pending requests:', error);
    res.status(500).json({ success: false, message: 'Error al obtener trámites pendientes' });
  }
};

export const getOverduePlateRequests = async (req, res) => {
  try {
    const requests = await PlateRequest.findOverdue()
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year vin')
      .sort({ expectedCompletionDate: 1 });

    res.json({ success: true, data: requests, count: requests.length });
  } catch (error) {
    logger.error('Error fetching overdue requests:', error);
    res.status(500).json({ success: false, message: 'Error al obtener trámites vencidos' });
  }
};

export const getPlateStats = async (req, res) => {
  try {
    const total = await PlateRequest.countDocuments({ isDeleted: false });
    const pending = await PlateRequest.countDocuments({ 
      status: { $in: ['pending', 'documents_review', 'submitted_transito', 'in_process'] }, 
      isDeleted: false 
    });
    const ready = await PlateRequest.countDocuments({ status: 'ready', isDeleted: false });
    const delivered = await PlateRequest.countDocuments({ status: 'delivered', isDeleted: false });

    const byType = await PlateRequest.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$requestType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { total, pending, ready, delivered, byType }
    });
  } catch (error) {
    logger.error('Error fetching plate stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export default {
  createPlateRequest,
  getPlateRequests,
  getPlateRequestById,
  updatePlateRequest,
  deletePlateRequest,
  submitToTransito,
  markAsReady,
  deliverPlate,
  cancelPlateRequest,
  getPendingPlateRequests,
  getOverduePlateRequests,
  getPlateStats
};
