import Purchase from '../models/Purchase.js';
import Vehicle from '../models/Vehicle.js';
import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';

export const createPurchase = async (req, res) => {
  try {
    const purchaseData = { ...req.body, createdBy: req.user._id };
    const purchase = new Purchase(purchaseData);
    purchase.calculateTotal();
    await purchase.save();
    
    logger.info(`Purchase created: ${purchase._id}`);
    res.status(201).json({ success: true, data: purchase, message: 'Compra creada exitosamente' });
  } catch (error) {
    logger.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const purchases = await Purchase.find(query)
      .populate('vehicle', 'brand model year vin')
      .populate('createdBy', 'name email')
      .sort({ purchaseDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data: purchases,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, message: 'Error al obtener compras' });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('vehicle')
      .populate('createdBy', 'name email')
      .populate('receivedBy', 'name email');
    
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada' });
    }
    res.json({ success: true, data: purchase });
  } catch (error) {
    logger.error('Error fetching purchase:', error);
    res.status(500).json({ success: false, message: 'Error al obtener compra' });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) purchase[key] = req.body[key];
    });

    if (req.body.unitPrice || req.body.quantity || req.body.shippingCost || req.body.taxes || req.body.additionalCosts) {
      purchase.calculateTotal();
    }

    await purchase.save();
    res.json({ success: true, data: purchase, message: 'Compra actualizada exitosamente' });
  } catch (error) {
    logger.error('Error updating purchase:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada' });
    }

    await purchase.softDelete(req.user._id);
    res.json({ success: true, message: 'Compra eliminada exitosamente' });
  } catch (error) {
    logger.error('Error deleting purchase:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar compra' });
  }
};

export const markAsReceived = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('vehicle');
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada' });
    }

    await purchase.markAsReceived(req.user._id);

    // Actualizar inventario
    const inventory = await Inventory.findOne({ vehicle: purchase.vehicle._id });
    if (inventory) {
      await inventory.registerEntry(purchase.quantity, 'purchase', req.user._id, purchase.purchaseNumber, 'Compra recibida');
    }

    res.json({ success: true, data: purchase, message: 'Compra marcada como recibida' });
  } catch (error) {
    logger.error('Error marking as received:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseStats = async (req, res) => {
  try {
    const total = await Purchase.countDocuments({ isDeleted: false });
    const pending = await Purchase.countDocuments({ status: 'pending', isDeleted: false });
    const received = await Purchase.countDocuments({ status: 'received', isDeleted: false });

    const totalSpent = await Purchase.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        received,
        totalSpent: totalSpent[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching purchase stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export default {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  markAsReceived,
  getPurchaseStats
};
