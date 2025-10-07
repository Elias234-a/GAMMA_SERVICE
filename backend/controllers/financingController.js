import Financing from '../models/Financing.js';
import Client from '../models/Client.js';
import Vehicle from '../models/Vehicle.js';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';

export const createFinancingApplication = async (req, res) => {
  try {
    const financingData = { ...req.body, processedBy: req.user._id };
    const financing = new Financing(financingData);
    
    financing.calculateMonthlyPayment();
    financing.calculateDebtToIncomeRatio();
    
    await financing.save();
    
    logger.info(`Financing application created: ${financing._id}`);
    res.status(201).json({ success: true, data: financing, message: 'Solicitud de financiamiento creada exitosamente' });
  } catch (error) {
    logger.error('Error creating financing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinancingApplications = async (req, res) => {
  try {
    const { status, client, vehicle, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (client) query.client = client;
    if (vehicle) query.vehicle = vehicle;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const applications = await Financing.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year price')
      .populate('processedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ applicationDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Financing.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching financing:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
  }
};

export const getFinancingById = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id)
      .populate('client')
      .populate('vehicle')
      .populate('sale')
      .populate('processedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }
    res.json({ success: true, data: financing });
  } catch (error) {
    logger.error('Error fetching financing:', error);
    res.status(500).json({ success: false, message: 'Error al obtener solicitud' });
  }
};

export const updateFinancing = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) financing[key] = req.body[key];
    });

    if (req.body.requestedAmount || req.body.downPayment || req.body.interestRate || req.body.term) {
      financing.calculateMonthlyPayment();
    }

    await financing.save();
    res.json({ success: true, data: financing, message: 'Solicitud actualizada exitosamente' });
  } catch (error) {
    logger.error('Error updating financing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFinancing = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await financing.softDelete(req.user._id);
    res.json({ success: true, message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    logger.error('Error deleting financing:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar solicitud' });
  }
};

export const evaluateCredit = async (req, res) => {
  try {
    const { score, status, notes } = req.body;
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    financing.creditEvaluation.score = score;
    financing.creditEvaluation.status = status;
    financing.creditEvaluation.notes = notes;
    financing.creditEvaluation.evaluatedBy = req.user._id;
    financing.creditEvaluation.evaluationDate = new Date();
    financing.status = 'under_review';

    await financing.save();
    res.json({ success: true, data: financing, message: 'Crédito evaluado exitosamente' });
  } catch (error) {
    logger.error('Error evaluating credit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveFinancing = async (req, res) => {
  try {
    const { approvedAmount } = req.body;
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await financing.approve(approvedAmount, req.user._id);

    await createNotification(
      financing.client,
      'success',
      'Financiamiento Aprobado',
      `Su solicitud de financiamiento #${financing.applicationNumber} ha sido aprobada por $${approvedAmount || financing.requestedAmount}`,
      { financingId: financing._id }
    );

    logger.info(`Financing approved: ${financing._id}`);
    res.json({ success: true, data: financing, message: 'Financiamiento aprobado exitosamente' });
  } catch (error) {
    logger.error('Error approving financing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectFinancing = async (req, res) => {
  try {
    const { reason } = req.body;
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await financing.reject(reason, req.user._id);

    await createNotification(
      financing.client,
      'error',
      'Financiamiento Rechazado',
      `Su solicitud de financiamiento #${financing.applicationNumber} ha sido rechazada`,
      { financingId: financing._id }
    );

    logger.info(`Financing rejected: ${financing._id}`);
    res.json({ success: true, data: financing, message: 'Financiamiento rechazado' });
  } catch (error) {
    logger.error('Error rejecting financing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disburseFinancing = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    await financing.disburse(req.user._id);
    logger.info(`Financing disbursed: ${financing._id}`);
    res.json({ success: true, data: financing, message: 'Financiamiento desembolsado exitosamente' });
  } catch (error) {
    logger.error('Error disbursing financing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePaymentSchedule = async (req, res) => {
  try {
    const financing = await Financing.findById(req.params.id);
    if (!financing) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    const schedule = financing.generatePaymentSchedule();
    await financing.save();

    res.json({ success: true, data: schedule, message: 'Tabla de amortización generada exitosamente' });
  } catch (error) {
    logger.error('Error generating schedule:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinancingStats = async (req, res) => {
  try {
    const total = await Financing.countDocuments({ isDeleted: false });
    const pending = await Financing.countDocuments({ status: 'pending', isDeleted: false });
    const approved = await Financing.countDocuments({ status: 'approved', isDeleted: false });
    const rejected = await Financing.countDocuments({ status: 'rejected', isDeleted: false });

    const totalFinanced = await Financing.aggregate([
      { $match: { status: { $in: ['approved', 'disbursed'] }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        totalFinanced: totalFinanced[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching financing stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export default {
  createFinancingApplication,
  getFinancingApplications,
  getFinancingById,
  updateFinancing,
  deleteFinancing,
  evaluateCredit,
  approveFinancing,
  rejectFinancing,
  disburseFinancing,
  generatePaymentSchedule,
  getFinancingStats
};
