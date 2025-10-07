import Sale from '../models/Sale.js';
import Vehicle from '../models/Vehicle.js';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';
import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';

export const createSale = async (req, res) => {
  try {
    const saleData = {
      ...req.body,
      salesperson: req.user._id
    };

    // Validar que el vehículo existe y está disponible
    const vehicle = await Vehicle.findById(saleData.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }
    if (vehicle.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Vehículo no disponible para venta' });
    }

    // Validar que el cliente existe
    const client = await Client.findById(saleData.client);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Crear venta
    const sale = new Sale(saleData);
    
    // Calcular totales
    sale.calculateTotal();
    sale.updateBalance();
    
    await sale.save();

    // Reservar vehículo
    vehicle.status = 'reserved';
    await vehicle.save();

    // Notificar al cliente
    await createNotification(
      client.user || client._id,
      'success',
      'Venta Registrada',
      `Su venta #${sale.saleNumber} ha sido registrada exitosamente`,
      { saleId: sale._id }
    );

    logger.info(`Sale created: ${sale._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: sale,
      message: 'Venta creada exitosamente'
    });
  } catch (error) {
    logger.error('Error creating sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSales = async (req, res) => {
  try {
    const {
      status,
      client,
      vehicle,
      salesperson,
      paymentStatus,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (status) query.status = status;
    if (client) query.client = client;
    if (vehicle) query.vehicle = vehicle;
    if (salesperson) query.salesperson = salesperson;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { saleNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const sales = await Sale.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year plate price')
      .populate('salesperson', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching sales:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas' });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client', 'firstName lastName email phone address')
      .populate('vehicle', 'brand model year plate vin color price')
      .populate('salesperson', 'name email')
      .populate('invoice')
      .populate('notes.createdBy', 'name');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    logger.error('Error fetching sale:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la venta' });
  }
};

export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) sale[key] = req.body[key];
    });

    // Recalcular si cambió algún precio
    if (req.body.basePrice || req.body.discount || req.body.taxes || req.body.additionalFees) {
      sale.calculateTotal();
      sale.updateBalance();
    }

    await sale.save();
    logger.info(`Sale updated: ${sale._id}`);

    res.json({ success: true, data: sale, message: 'Venta actualizada exitosamente' });
  } catch (error) {
    logger.error('Error updating sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    await sale.softDelete(req.user._id);
    
    // Liberar vehículo si estaba reservado
    const vehicle = await Vehicle.findById(sale.vehicle);
    if (vehicle && vehicle.status === 'reserved') {
      await vehicle.markAsAvailable();
    }

    logger.info(`Sale deleted: ${sale._id}`);
    res.json({ success: true, message: 'Venta eliminada exitosamente' });
  } catch (error) {
    logger.error('Error deleting sale:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la venta' });
  }
};

export const confirmSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client')
      .populate('vehicle');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    await sale.confirm(req.user._id);

    // Marcar vehículo como vendido
    await sale.vehicle.markAsSold(sale.client._id);

    // Actualizar inventario
    const inventory = await Inventory.findOne({ vehicle: sale.vehicle._id });
    if (inventory) {
      await inventory.registerExit(1, 'sale', req.user._id, sale.saleNumber, 'Venta confirmada');
    }

    // Actualizar estadísticas del cliente
    await sale.client.updatePurchaseStats(sale.totalPrice);

    // Notificar
    await createNotification(
      sale.client.user || sale.client._id,
      'success',
      'Venta Confirmada',
      `Su venta #${sale.saleNumber} ha sido confirmada`,
      { saleId: sale._id }
    );

    logger.info(`Sale confirmed: ${sale._id}`);
    res.json({ success: true, data: sale, message: 'Venta confirmada exitosamente' });
  } catch (error) {
    logger.error('Error confirming sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    await sale.complete(req.user._id);

    // Notificar
    await createNotification(
      sale.client,
      'success',
      'Venta Completada',
      `Su venta #${sale.saleNumber} ha sido completada. Vehículo entregado.`,
      { saleId: sale._id }
    );

    logger.info(`Sale completed: ${sale._id}`);
    res.json({ success: true, data: sale, message: 'Venta completada exitosamente' });
  } catch (error) {
    logger.error('Error completing sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSale = async (req, res) => {
  try {
    const { reason } = req.body;
    const sale = await Sale.findById(req.params.id).populate('vehicle');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    await sale.cancel(reason, req.user._id);

    // Restaurar vehículo a disponible
    if (sale.vehicle) {
      await sale.vehicle.markAsAvailable();
    }

    // Restaurar inventario
    const inventory = await Inventory.findOne({ vehicle: sale.vehicle._id });
    if (inventory) {
      await inventory.registerEntry(1, 'sale_cancellation', req.user._id, sale.saleNumber, `Venta cancelada: ${reason}`);
    }

    logger.info(`Sale cancelled: ${sale._id}`);
    res.json({ success: true, data: sale, message: 'Venta cancelada exitosamente' });
  } catch (error) {
    logger.error('Error cancelling sale:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSaleStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { isDeleted: false };

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    const total = await Sale.countDocuments(query);
    const completed = await Sale.countDocuments({ ...query, status: 'completed' });
    const pending = await Sale.countDocuments({ ...query, status: 'pending' });
    const cancelled = await Sale.countDocuments({ ...query, status: 'cancelled' });

    const revenue = await Sale.aggregate([
      { $match: { ...query, status: { $in: ['completed', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const bySalesperson = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$salesperson',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const byMonth = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        cancelled,
        totalRevenue: revenue[0]?.total || 0,
        averageSale: total > 0 ? (revenue[0]?.total || 0) / total : 0,
        bySalesperson,
        byMonth
      }
    });
  } catch (error) {
    logger.error('Error fetching sale stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export const getSalesByClient = async (req, res) => {
  try {
    const sales = await Sale.find({
      client: req.params.clientId,
      isDeleted: false
    })
      .populate('vehicle', 'brand model year plate')
      .sort({ saleDate: -1 });

    res.json({ success: true, data: sales, count: sales.length });
  } catch (error) {
    logger.error('Error fetching sales by client:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas del cliente' });
  }
};

export default {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  confirmSale,
  completeSale,
  cancelSale,
  getSaleStats,
  getSalesByClient
};
