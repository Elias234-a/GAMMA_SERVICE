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
    
    // Usar búsqueda de texto si está disponible (OPTIMIZACIÓN)
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // OPTIMIZACIÓN: Solo seleccionar campos necesarios y usar .lean()
    const clients = await Client.find(query)
      .select('firstName lastName email phone identificationNumber status category totalSpent totalPurchases address.city createdAt')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Retorna objetos JS planos, 40-60% más rápido

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
    // OPTIMIZACIÓN: Usar agregación $facet para reducir múltiples queries a una
    const stats = await Client.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                vip: { $sum: { $cond: [{ $eq: ['$category', 'vip'] }, 1, 0] } },
                prospects: { $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] } }
              }
            }
          ],
          topClients: [
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                totalSpent: 1,
                totalPurchases: 1
              }
            }
          ]
        }
      }
    ]);

    const { counts, topClients } = stats[0];
    const { total, active, vip, prospects } = counts[0] || { total: 0, active: 0, vip: 0, prospects: 0 };

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
