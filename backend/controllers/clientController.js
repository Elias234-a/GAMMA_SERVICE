import Client from '../models/Client.js';
import Sale from '../models/Sale.js';
import logger from '../config/logger.js';

export const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    
    logger.info(`Client created: ${client._id}`);
    res.status(201).json({ success: true, data: client, message: 'Cliente creado exitosamente' });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClients = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { identificationNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clients = await Client.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: clients,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('referredBy', 'firstName lastName email');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Obtener historial de compras
    const purchases = await Sale.find({ client: client._id, isDeleted: false })
      .populate('vehicle', 'brand model year')
      .sort({ saleDate: -1 })
      .limit(10);

    res.json({ success: true, data: { ...client.toObject(), purchases } });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el cliente' });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) client[key] = req.body[key];
    });

    await client.save();
    logger.info(`Client updated: ${client._id}`);

    res.json({ success: true, data: client, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    await client.softDelete(req.user._id);
    logger.info(`Client deleted: ${client._id}`);

    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el cliente' });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const total = await Client.countDocuments({ isDeleted: false });
    const active = await Client.countDocuments({ status: 'active', isDeleted: false });
    const vip = await Client.countDocuments({ category: 'vip', isDeleted: false });
    const prospects = await Client.countDocuments({ category: 'prospect', isDeleted: false });

    const topClients = await Client.find({ isDeleted: false })
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('firstName lastName totalSpent totalPurchases');

    res.json({
      success: true,
      data: { total, active, vip, prospects, topClients }
    });
  } catch (error) {
    logger.error('Error fetching client stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export const evaluateCredit = async (req, res) => {
  try {
    const { score, status } = req.body;
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    await client.evaluateCredit(score, status);
    
    res.json({ success: true, data: client, message: 'Crédito evaluado exitosamente' });
  } catch (error) {
    logger.error('Error evaluating credit:', error);
    res.status(500).json({ success: false, message: 'Error al evaluar crédito' });
  }
};

export default {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  evaluateCredit
};
