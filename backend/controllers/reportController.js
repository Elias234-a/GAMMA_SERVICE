import Sale from '../models/Sale.js';
import Client from '../models/Client.js';
import Vehicle from '../models/Vehicle.js';
import Invoice from '../models/Invoice.js';
import Service from '../models/Service.js';
import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';

export const getGeneralStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Estadísticas de ventas
    const salesStats = await Sale.aggregate([
      { $match: { isDeleted: false, ...dateQuery } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          completedSales: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Estadísticas de clientes
    const clientStats = await Client.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          vipClients: {
            $sum: { $cond: [{ $eq: ['$category', 'vip'] }, 1, 0] }
          }
        }
      }
    ]);

    // Estadísticas de vehículos
    const vehicleStats = await Vehicle.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          availableVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          inventoryValue: { $sum: '$price' }
        }
      }
    ]);

    // Estadísticas de servicios
    const serviceStats = await Service.aggregate([
      { $match: { isDeleted: false, ...dateQuery } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          completedServices: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          serviceRevenue: { $sum: '$totalCost' }
        }
      }
    ]);

    // Estadísticas de facturas
    const invoiceStats = await Invoice.aggregate([
      { $match: { isDeleted: false, ...dateQuery } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalPending: { $sum: '$balanceDue' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        sales: salesStats[0] || {},
        clients: clientStats[0] || {},
        vehicles: vehicleStats[0] || {},
        services: serviceStats[0] || {},
        invoices: invoiceStats[0] || {},
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'now'
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching general stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas generales' });
  }
};

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, salesperson, status } = req.query;
    const query = { isDeleted: false };

    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    if (salesperson) query.salesperson = salesperson;
    if (status) query.status = status;

    const sales = await Sale.find(query)
      .populate('client', 'firstName lastName email')
      .populate('vehicle', 'brand model year plate price')
      .populate('salesperson', 'name email')
      .sort({ saleDate: -1 });

    const summary = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageSale: { $avg: '$totalPrice' },
          totalDownPayments: { $sum: '$downPayment' }
        }
      }
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
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        sales,
        summary: summary[0] || {},
        bySalesperson
      }
    });
  } catch (error) {
    logger.error('Error generating sales report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte de ventas' });
  }
};

export const getClientsReport = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (category) query.category = category;

    const clients = await Client.find(query)
      .select('firstName lastName email phone totalPurchases totalSpent lastPurchaseDate status category')
      .sort({ totalSpent: -1 });

    const summary = await Client.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' },
          totalPurchases: { $sum: '$totalPurchases' }
        }
      }
    ]);

    const byCategory = await Client.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 }, totalSpent: { $sum: '$totalSpent' } } },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        clients,
        summary: summary[0] || {},
        byCategory
      }
    });
  } catch (error) {
    logger.error('Error generating clients report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte de clientes' });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const { status, location } = req.query;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (location) query.location = location;

    const inventory = await Inventory.find(query)
      .populate('vehicle', 'brand model year plate price cost')
      .sort({ location: 1 });

    const summary = await Inventory.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleData'
        }
      },
      { $unwind: '$vehicleData' },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$vehicleData.price'] } },
          totalCost: { $sum: { $multiply: ['$quantity', '$vehicleData.cost'] } }
        }
      }
    ]);

    const byLocation = await Inventory.aggregate([
      { $match: query },
      { $group: { _id: '$location', count: { $sum: '$quantity' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        inventory,
        summary: summary[0] || {},
        byLocation
      }
    });
  } catch (error) {
    logger.error('Error generating inventory report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte de inventario' });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery.saleDate = {};
      if (startDate) dateQuery.saleDate.$gte = new Date(startDate);
      if (endDate) dateQuery.saleDate.$lte = new Date(endDate);
    }

    // Ingresos por ventas
    const salesRevenue = await Sale.aggregate([
      { $match: { isDeleted: false, status: { $in: ['completed', 'confirmed'] }, ...dateQuery } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Ingresos por servicios
    const servicesRevenue = await Service.aggregate([
      { $match: { isDeleted: false, status: 'completed', ...dateQuery } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Cuentas por cobrar
    const accountsReceivable = await Invoice.aggregate([
      { $match: { isDeleted: false, paymentStatus: { $ne: 'paid' } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$balanceDue' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Facturas pagadas
    const paidInvoices = await Invoice.aggregate([
      { $match: { isDeleted: false, paymentStatus: 'paid', ...dateQuery } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        salesRevenue: salesRevenue[0] || { total: 0, count: 0 },
        servicesRevenue: servicesRevenue[0] || { total: 0, count: 0 },
        accountsReceivable: accountsReceivable[0] || { total: 0, count: 0 },
        paidInvoices: paidInvoices[0] || { total: 0, count: 0 },
        totalRevenue: (salesRevenue[0]?.total || 0) + (servicesRevenue[0]?.total || 0),
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'now'
        }
      }
    });
  } catch (error) {
    logger.error('Error generating financial report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte financiero' });
  }
};

export const getServiceReport = async (req, res) => {
  try {
    const { startDate, endDate, status, serviceType } = req.query;
    const query = { isDeleted: false };

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const services = await Service.find(query)
      .populate('client', 'firstName lastName email')
      .populate('vehicle', 'brand model year plate')
      .populate('technician', 'name')
      .sort({ scheduledDate: -1 });

    const summary = await Service.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          averageCost: { $avg: '$totalCost' },
          totalLaborCost: { $sum: '$laborCost' },
          totalPartsCost: { $sum: '$partsCost' }
        }
      }
    ]);

    const byType = await Service.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          revenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        services,
        summary: summary[0] || {},
        byType
      }
    });
  } catch (error) {
    logger.error('Error generating service report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte de servicios' });
  }
};

export default {
  getGeneralStats,
  getSalesReport,
  getClientsReport,
  getInventoryReport,
  getFinancialReport,
  getServiceReport
};
