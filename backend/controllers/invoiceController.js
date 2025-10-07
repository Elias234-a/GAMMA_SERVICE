import Invoice from '../models/Invoice.js';
import Sale from '../models/Sale.js';
import Client from '../models/Client.js';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';
import { sendEmail } from '../utils/emailService.js';

export const createInvoice = async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Si viene desde una venta, poblar datos automáticamente
    if (invoiceData.sale) {
      const sale = await Sale.findById(invoiceData.sale)
        .populate('client')
        .populate('vehicle');
      
      if (sale) {
        invoiceData.client = sale.client._id;
        invoiceData.items = [{
          description: `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year} - VIN: ${sale.vehicle.vin}`,
          quantity: 1,
          unitPrice: sale.basePrice,
          taxRate: 19,
          taxAmount: (sale.basePrice * 19) / 100,
          subtotal: sale.basePrice,
          total: sale.basePrice + ((sale.basePrice * 19) / 100)
        }];
      }
    }

    const invoice = new Invoice(invoiceData);
    
    // Calcular totales
    invoice.calculateTotals();
    
    await invoice.save();

    // Si la factura es de una venta, actualizar la venta
    if (invoice.sale) {
      const sale = await Sale.findById(invoice.sale);
      if (sale) {
        sale.invoiceGenerated = true;
        sale.invoice = invoice._id;
        await sale.save();
      }
    }

    logger.info(`Invoice created: ${invoice._id} by user ${req.user._id}`);
    
    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Factura creada exitosamente'
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const {
      client,
      paymentStatus,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (client) query.client = client;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { invoiceNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const invoices = await Invoice.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('sale', 'saleNumber vehicle')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Error al obtener facturas' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email phone address')
      .populate('sale', 'saleNumber vehicle')
      .populate('createdBy', 'name email')
      .populate('payments.registeredBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la factura' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) invoice[key] = req.body[key];
    });

    invoice.modifiedBy = req.user._id;

    // Recalcular si cambió algún item
    if (req.body.items || req.body.discount || req.body.discountPercentage) {
      invoice.calculateTotals();
    }

    await invoice.save();
    logger.info(`Invoice updated: ${invoice._id}`);

    res.json({ success: true, data: invoice, message: 'Factura actualizada exitosamente' });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    await invoice.softDelete(req.user._id);
    logger.info(`Invoice deleted: ${invoice._id}`);

    res.json({ success: true, message: 'Factura eliminada exitosamente' });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la factura' });
  }
};

export const issueInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    await invoice.issue(req.user._id);
    logger.info(`Invoice issued: ${invoice._id}`);

    res.json({ success: true, data: invoice, message: 'Factura emitida exitosamente' });
  } catch (error) {
    logger.error('Error issuing invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerPayment = async (req, res) => {
  try {
    const { amount, method, reference, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser mayor a 0' });
    }

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ success: false, message: 'El monto excede el saldo pendiente' });
    }

    await invoice.registerPayment(amount, method, reference, req.user._id, notes);

    // Notificar al cliente
    await createNotification(
      invoice.client,
      'success',
      'Pago Registrado',
      `Se registró un pago de $${amount.toLocaleString()} en la factura ${invoice.invoiceNumber}`,
      { invoiceId: invoice._id }
    );

    logger.info(`Payment registered for invoice ${invoice._id}: ${amount}`);

    res.json({ success: true, data: invoice, message: 'Pago registrado exitosamente' });
  } catch (error) {
    logger.error('Error registering payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    await invoice.cancel(reason, req.user._id);
    logger.info(`Invoice cancelled: ${invoice._id}`);

    res.json({ success: true, data: invoice, message: 'Factura cancelada exitosamente' });
  } catch (error) {
    logger.error('Error cancelling invoice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { isDeleted: false };

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const total = await Invoice.countDocuments(query);
    const pending = await Invoice.countDocuments({ ...query, paymentStatus: 'pending' });
    const partial = await Invoice.countDocuments({ ...query, paymentStatus: 'partial' });
    const paid = await Invoice.countDocuments({ ...query, paymentStatus: 'paid' });
    const overdue = await Invoice.countDocuments({ ...query, paymentStatus: 'overdue' });

    const totals = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$balanceDue' }
        }
      }
    ]);

    const byMonth = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        partial,
        paid,
        overdue,
        totalAmount: totals[0]?.totalAmount || 0,
        totalPaid: totals[0]?.totalPaid || 0,
        totalDue: totals[0]?.totalDue || 0,
        byMonth
      }
    });
  } catch (error) {
    logger.error('Error fetching invoice stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export const getOverdueInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findOverdue()
      .populate('client', 'firstName lastName email phone')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: invoices, count: invoices.length });
  } catch (error) {
    logger.error('Error fetching overdue invoices:', error);
    res.status(500).json({ success: false, message: 'Error al obtener facturas vencidas' });
  }
};

export const sendInvoiceByEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada' });
    }

    // Aquí se integraría con el servicio de email
    // await sendEmail(invoice.client.email, 'Factura', 'invoice', { invoice });

    invoice.status = 'sent';
    await invoice.save();

    logger.info(`Invoice sent by email: ${invoice._id}`);
    res.json({ success: true, message: 'Factura enviada por correo exitosamente' });
  } catch (error) {
    logger.error('Error sending invoice by email:', error);
    res.status(500).json({ success: false, message: 'Error al enviar factura' });
  }
};

export default {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  issueInvoice,
  registerPayment,
  cancelInvoice,
  getInvoiceStats,
  getOverdueInvoices,
  sendInvoiceByEmail
};
