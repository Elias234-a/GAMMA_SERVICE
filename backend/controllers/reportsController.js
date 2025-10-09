import Sale from '../models/Sale.js';
import Vehicle from '../models/Vehicle.js';
import Client from '../models/Client.js';
import pdfGenerator from '../utils/pdfGenerator.js';
import excelGenerator from '../utils/excelGenerator.js';
import logger from '../config/logger.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de reportes si no existe
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * GET /api/reports/sales
 * Generar reporte de ventas
 */
export const generateSalesReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.query;

    // Construir query
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Obtener ventas
    const sales = await Sale.find(query)
      .populate('client', 'name document email')
      .populate('vehicle', 'plate brand model')
      .sort({ createdAt: -1 });

    // Calcular resumen
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const count = sales.length;
    const average = count > 0 ? total / count : 0;

    // Preparar datos
    const reportData = {
      period: startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString('es-MX')} - ${new Date(endDate).toLocaleDateString('es-MX')}`
        : 'Todo el período',
      summary: {
        total,
        count,
        average
      },
      sales: sales.map(sale => ({
        date: sale.createdAt,
        clientName: sale.client?.name || 'N/A',
        clientDocument: sale.client?.document || 'N/A',
        vehiclePlate: sale.vehicle?.plate || 'N/A',
        amount: sale.totalAmount,
        status: sale.status,
        seller: sale.seller?.name || 'N/A'
      })),
      chartData: [] // Se puede agregar análisis por mes
    };

    // Generar según formato
    const filename = `sales_report_${Date.now()}.${format}`;
    const outputPath = path.join(reportsDir, filename);

    if (format === 'pdf') {
      await pdfGenerator.generateSalesReport(reportData, outputPath);
    } else if (format === 'excel' || format === 'xlsx') {
      await excelGenerator.generateSalesReport(reportData, outputPath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato no soportado. Use pdf o excel'
      });
    }

    logger.info('Sales report generated', {
      userId: req.user.id,
      format,
      filename
    });

    // Enviar archivo
    res.download(outputPath, filename, (err) => {
      if (err) {
        logger.error('Error sending report:', err);
      }
      // Eliminar archivo después de enviar
      setTimeout(() => {
        fs.unlink(outputPath, () => {});
      }, 5000);
    });

  } catch (error) {
    logger.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el reporte',
      error: error.message
    });
  }
};

/**
 * GET /api/reports/inventory
 * Generar reporte de inventario
 */
export const generateInventoryReport = async (req, res) => {
  try {
    const { format = 'pdf', status } = req.query;

    // Construir query
    const query = {};
    if (status) query.status = status;

    // Obtener vehículos
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

    // Calcular estadísticas
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'Disponible').length;
    const sold = vehicles.filter(v => v.status === 'Vendido').length;
    const maintenance = vehicles.filter(v => v.status === 'Mantenimiento').length;
    const totalValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);

    // Preparar datos
    const reportData = {
      total,
      available,
      sold,
      maintenance,
      totalValue,
      vehicles: vehicles.map(v => ({
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        price: v.price,
        status: v.status,
        location: v.location
      }))
    };

    // Generar según formato
    const filename = `inventory_report_${Date.now()}.${format}`;
    const outputPath = path.join(reportsDir, filename);

    if (format === 'pdf') {
      await pdfGenerator.generateInventoryReport(reportData, outputPath);
    } else if (format === 'excel' || format === 'xlsx') {
      await excelGenerator.generateInventoryReport(reportData, outputPath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato no soportado'
      });
    }

    logger.info('Inventory report generated', {
      userId: req.user.id,
      format,
      filename
    });

    res.download(outputPath, filename, (err) => {
      if (err) {
        logger.error('Error sending report:', err);
      }
      setTimeout(() => {
        fs.unlink(outputPath, () => {});
      }, 5000);
    });

  } catch (error) {
    logger.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el reporte',
      error: error.message
    });
  }
};

/**
 * GET /api/reports/clients
 * Generar reporte de clientes
 */
export const generateClientsReport = async (req, res) => {
  try {
    const { format = 'excel' } = req.query;

    // Obtener clientes con estadísticas de compras
    const clients = await Client.find().sort({ createdAt: -1 });

    // Para cada cliente, obtener sus compras
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const purchases = await Sale.find({ client: client._id });
        const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const lastPurchase = purchases.length > 0 
          ? purchases.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt
          : null;

        return {
          name: client.name,
          document: client.document,
          email: client.email,
          phone: client.phone,
          purchaseCount: purchases.length,
          totalSpent,
          lastPurchase
        };
      })
    );

    const reportData = {
      clients: clientsWithStats.sort((a, b) => b.totalSpent - a.totalSpent)
    };

    const filename = `clients_report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    const outputPath = path.join(reportsDir, filename);

    if (format === 'excel' || format === 'xlsx') {
      await excelGenerator.generateClientsReport(reportData, outputPath);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Solo formato Excel soportado para reporte de clientes'
      });
    }

    logger.info('Clients report generated', {
      userId: req.user.id,
      format,
      filename
    });

    res.download(outputPath, filename, (err) => {
      if (err) {
        logger.error('Error sending report:', err);
      }
      setTimeout(() => {
        fs.unlink(outputPath, () => {});
      }, 5000);
    });

  } catch (error) {
    logger.error('Error generating clients report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el reporte',
      error: error.message
    });
  }
};

/**
 * GET /api/reports/financial
 * Generar reporte financiero
 */
export const generateFinancialReport = async (req, res) => {
  try {
    const { format = 'excel', startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Ingresos (ventas)
    const sales = await Sale.find(query);
    const totalIncome = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Egresos (esto depende de tu modelo, ejemplo simplificado)
    const expenses = [
      { concept: 'Compra de vehículos', amount: totalIncome * 0.6 },
      { concept: 'Salarios', amount: 50000 },
      { concept: 'Mantenimiento', amount: 10000 },
      { concept: 'Servicios', amount: 5000 },
      { concept: 'Otros gastos', amount: 3000 }
    ];

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const reportData = {
      income: [
        { concept: 'Ventas de vehículos', amount: totalIncome }
      ],
      expenses,
      totalIncome,
      totalExpenses,
      balance
    };

    const filename = `financial_report_${Date.now()}.xlsx`;
    const outputPath = path.join(reportsDir, filename);

    await excelGenerator.generateFinancialReport(reportData, outputPath);

    logger.info('Financial report generated', {
      userId: req.user.id,
      format,
      filename
    });

    res.download(outputPath, filename, (err) => {
      if (err) {
        logger.error('Error sending report:', err);
      }
      setTimeout(() => {
        fs.unlink(outputPath, () => {});
      }, 5000);
    });

  } catch (error) {
    logger.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el reporte',
      error: error.message
    });
  }
};

/**
 * POST /api/reports/invoice
 * Generar factura
 */
export const generateInvoice = async (req, res) => {
  try {
    const { saleId } = req.body;

    const sale = await Sale.findById(saleId)
      .populate('client')
      .populate('vehicle');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Preparar datos de factura
    const invoiceData = {
      number: sale.invoiceNumber || `INV-${Date.now()}`,
      client: {
        name: sale.client.name,
        document: sale.client.document,
        email: sale.client.email,
        phone: sale.client.phone
      },
      items: [
        {
          description: `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year} - ${sale.vehicle.plate}`,
          quantity: 1,
          price: sale.vehiclePrice || sale.totalAmount / 1.19
        }
      ],
      subtotal: sale.totalAmount / 1.19,
      tax: sale.totalAmount - (sale.totalAmount / 1.19),
      total: sale.totalAmount
    };

    const filename = `invoice_${invoiceData.number}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    await pdfGenerator.generateInvoice(invoiceData, outputPath);

    logger.info('Invoice generated', {
      userId: req.user.id,
      saleId,
      invoiceNumber: invoiceData.number
    });

    res.download(outputPath, filename, (err) => {
      if (err) {
        logger.error('Error sending invoice:', err);
      }
      setTimeout(() => {
        fs.unlink(outputPath, () => {});
      }, 5000);
    });

  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando la factura',
      error: error.message
    });
  }
};

/**
 * GET /api/reports/dashboard
 * Obtener datos para dashboard
 */
export const getDashboardData = async (req, res) => {
  try {
    const { period = '30' } = req.query; // días
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Ventas del período
    const sales = await Sale.find({
      createdAt: { $gte: startDate }
    });

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const salesCount = sales.length;

    // Inventario
    const vehicles = await Vehicle.find();
    const availableVehicles = vehicles.filter(v => v.status === 'Disponible').length;

    // Clientes
    const totalClients = await Client.countDocuments();

    // Ventas por día (últimos 7 días)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = await Sale.find({
        createdAt: { $gte: date, $lt: nextDate }
      });

      last7Days.push({
        date: date.toLocaleDateString('es-MX'),
        sales: daySales.length,
        amount: daySales.reduce((sum, s) => sum + s.totalAmount, 0)
      });
    }

    // Top 5 vehículos más vendidos (por marca/modelo)
    const topVehicles = await Sale.aggregate([
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
          _id: {
            brand: '$vehicleData.brand',
            model: '$vehicleData.model'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          salesCount,
          averageTicket: salesCount > 0 ? totalSales / salesCount : 0,
          availableVehicles,
          totalClients
        },
        salesTrend: last7Days,
        topVehicles: topVehicles.map(v => ({
          name: `${v._id.brand} ${v._id.model}`,
          count: v.count,
          amount: v.totalAmount
        }))
      }
    });

  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos del dashboard'
    });
  }
};

export default {
  generateSalesReport,
  generateInventoryReport,
  generateClientsReport,
  generateFinancialReport,
  generateInvoice,
  getDashboardData
};
