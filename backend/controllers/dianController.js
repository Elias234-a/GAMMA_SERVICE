import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Dian from '../models/Dian.js';
import Company from '../models/Company.js';
import { validationResult } from 'express-validator';
import { createNotification } from '../utils/notifications.js';

// Configuración de la API de la DIAN
const DIAN_API_URL = process.env.DIAN_API_URL || 'https://facturaelectronica.dian.gov.co/habilitacion';
const DIAN_API_KEY = process.env.DIAN_API_KEY;

if (!DIAN_API_KEY) {
  console.warn('ADVERTENCIA: No se ha configurado la API key de la DIAN');
}

/**
 * Cliente para hacer peticiones a la API de la DIAN
 */
const dianClient = axios.create({
  baseURL: DIAN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DIAN_API_KEY}`,
    'Accept': 'application/json'
  }
});

/**
 * Genera una factura electrónica
 * @route POST /api/dian/invoices
 * @access private
 */
export const createInvoice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, customer, items, paymentMethod, notes } = req.body;
    
    // Obtener información de la empresa emisora
    const company = await Company.findOne({ user: req.user._id });
    if (!company || !company.dianEnabled) {
      return res.status(400).json({ 
        message: 'La facturación electrónica no está habilitada para su empresa' 
      });
    }

    // Validar que la orden exista
    const order = await Order.findById(orderId)
      .populate('client', 'name identification email phone')
      .populate('technician', 'specialty');

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Validar que el usuario tenga permiso sobre esta orden
    if (order.client._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para facturar esta orden' });
    }

    // Validar que la orden no esté ya facturada
    const existingInvoice = await Dian.findOne({ order: orderId });
    if (existingInvoice) {
      return res.status(400).json({ 
        message: 'Esta orden ya tiene una factura asociada',
        invoiceId: existingInvoice._id
      });
    }

    // Calcular totales
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.19; // IVA 19% (Colombia)
    const total = subtotal + tax;

    // Construir objeto de factura según estándar DIAN
    const invoiceData = {
      id: uuidv4(),
      type: 'invoice',
      number: `FAC-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      issueTime: new Date().toTimeString().split(' ')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
      currency: 'COP',
      exchangeRate: 1,
      issuer: {
        taxId: company.taxId,
        name: company.legalName,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        country: 'CO',
        postalCode: company.postalCode,
        regime: company.taxRegime
      },
      customer: {
        taxId: customer.identification,
        type: customer.type || 'Persona Jurídica',
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country || 'CO',
        postalCode: customer.postalCode,
        responsibility: customer.responsibility || 'R-99-PN'
      },
      items: items.map(item => ({
        code: item.code || '001',
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        tax: item.tax || 19, // IVA 19%
        discount: item.discount || 0,
        sku: item.sku || '',
        unit: item.unit || '94' // 94 = Unidad de servicio
      })),
      payment: {
        method: paymentMethod || '1', // 1 = Contado, 2 = Crédito
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        terms: 'Pago a 30 días'
      },
      notes: notes || '',
      subtotal: subtotal,
      tax: tax,
      total: total,
      status: 'draft', // draft, generated, sent, accepted, rejected, cancelled
      order: orderId,
      createdBy: req.user._id
    };

    // En producción, enviar a la DIAN
    let dianResponse = {};
    if (process.env.NODE_ENV === 'production' && DIAN_API_KEY) {
      try {
        const response = await dianClient.post('/invoices', invoiceData);
        dianResponse = response.data;
        invoiceData.status = 'generated';
        invoiceData.cufe = dianResponse.cufe;
        invoiceData.qrCode = dianResponse.qrCode;
        invoiceData.pdfUrl = dianResponse.pdfUrl;
        invoiceData.xmlUrl = dianResponse.xmlUrl;
        invoiceData.dianResponse = dianResponse;
      } catch (error) {
        console.error('Error al enviar factura a la DIAN:', error.response?.data || error.message);
        invoiceData.status = 'error';
        invoiceData.error = error.response?.data || error.message;
      }
    } else {
      // En desarrollo, simular respuesta exitosa
      invoiceData.status = 'generated';
      invoiceData.cufe = `TEST-${uuidv4()}`;
      invoiceData.qrCode = 'https://example.com/qr-code.png';
      invoiceData.pdfUrl = 'https://example.com/invoice.pdf';
      invoiceData.xmlUrl = 'https://example.com/invoice.xml';
      invoiceData.dianResponse = { success: true, message: 'Modo de prueba' };
    }

    // Guardar la factura en la base de datos
    const invoice = new Dian(invoiceData);
    await invoice.save();

    // Actualizar la orden con la referencia a la factura
    order.invoice = invoice._id;
    order.status = 'completed';
    await order.save();

    // Notificar al cliente
    if (customer.email) {
      await createNotification(
        customer.email,
        'info',
        'Factura Generada',
        `Se ha generado la factura #${invoice.number} por un valor de $${total.toLocaleString('es-CO')}`,
        { invoiceId: invoice._id, orderId }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Factura generada correctamente',
      invoice: {
        ...invoice.toObject(),
        dianResponse: process.env.NODE_ENV === 'production' ? 'Oculto en producción' : invoice.dianResponse
      }
    });
  } catch (error) {
    console.error('Error al generar factura:', error);
    next(error);
  }
};

/**
 * Obtiene el estado de una factura
 * @route GET /api/dian/invoices/:id/status
 * @access private
 */
export const getInvoiceStatus = async (req, res, next) => {
  try {
    const invoice = await Dian.findById(req.params.id)
      .populate('order', 'number status')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Verificar permisos
    if (invoice.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para ver esta factura' });
    }

    // En producción, verificar estado en la DIAN
    if (process.env.NODE_ENV === 'production' && DIAN_API_KEY) {
      try {
        const response = await dianClient.get(`/invoices/${invoice.id}/status`);
        invoice.status = response.data.status;
        invoice.dianResponse = response.data;
        await invoice.save();
      } catch (error) {
        console.error('Error al consultar estado en la DIAN:', error.response?.data || error.message);
      }
    }

    res.json({
      success: true,
      invoice: {
        id: invoice._id,
        number: invoice.number,
        status: invoice.status,
        total: invoice.total,
        issueDate: invoice.issueDate,
        order: invoice.order,
        createdBy: invoice.createdBy,
        cufe: invoice.cufe,
        qrCode: invoice.qrCode,
        pdfUrl: invoice.pdfUrl,
        xmlUrl: invoice.xmlUrl,
        dianResponse: process.env.NODE_ENV === 'production' ? 'Oculto en producción' : invoice.dianResponse
      }
    });
  } catch (error) {
    console.error('Error al consultar estado de factura:', error);
    next(error);
  }
};

/**
 * Descarga la representación gráfica de una factura (PDF)
 * @route GET /api/dian/invoices/:id/pdf
 * @access private
 */
export const downloadPdf = async (req, res, next) => {
  try {
    const invoice = await Dian.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Verificar permisos
    if (invoice.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para descargar esta factura' });
    }

    if (!invoice.pdfUrl) {
      return res.status(404).json({ message: 'PDF no disponible para esta factura' });
    }

    // Redirigir a la URL del PDF o enviar el archivo directamente
    if (process.env.NODE_ENV === 'production') {
      res.redirect(invoice.pdfUrl);
    } else {
      // En desarrollo, simular la descarga
      res.download(invoice.pdfUrl, `factura-${invoice.number}.pdf`);
    }
  } catch (error) {
    console.error('Error al descargar PDF de factura:', error);
    next(error);
  }
};

/**
 * Obtiene el historial de facturas
 * @route GET /api/dian/invoices
 * @access private
 */
export const getInvoices = async (req, res, next) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Filtrar por fechas
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.issueDate.$lte = end;
      }
    }
    
    // Filtrar por estado
    if (status) {
      query.status = status;
    }
    
    // Filtrar por empresa del usuario (si no es admin)
    if (req.user.role !== 'admin') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) {
        query.company = company._id;
      } else {
        // Si el usuario no tiene empresa, solo mostrar sus facturas
        query.createdBy = req.user._id;
      }
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'order', select: 'number client' },
        { path: 'createdBy', select: 'name email' }
      ]
    };
    
    const invoices = await Dian.paginate(query, options);
    
    res.json({
      success: true,
      ...invoices
    });
  } catch (error) {
    console.error('Error al obtener historial de facturas:', error);
    next(error);
  }
};

/**
 * Anula una factura
 * @route POST /api/dian/invoices/:id/void
 * @access private/admin
 */
export const voidInvoice = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Debe proporcionar una razón para la anulación' });
    }
    
    const invoice = await Dian.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('order', 'number status');
      
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Verificar que la factura no esté ya anulada
    if (invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'La factura ya está anulada' });
    }
    
    // En producción, enviar solicitud de anulación a la DIAN
    if (process.env.NODE_ENV === 'production' && DIAN_API_KEY) {
      try {
        await dianClient.post(`/invoices/${invoice.id}/void`, { reason });
      } catch (error) {
        console.error('Error al anular factura en la DIAN:', error.response?.data || error.message);
        return res.status(500).json({
          message: 'Error al anular la factura en la DIAN',
          error: error.response?.data || error.message
        });
      }
    }
    
    // Actualizar estado de la factura
    invoice.status = 'cancelled';
    invoice.cancellation = {
      date: new Date(),
      reason,
      cancelledBy: req.user._id
    };
    
    const updatedInvoice = await invoice.save();
    
    // Actualizar estado de la orden
    if (invoice.order) {
      await Order.findByIdAndUpdate(invoice.order._id, { status: 'cancelled' });
    }
    
    // Registrar la anulación
    await createNotification(
      invoice.createdBy._id,
      'warning',
      'Factura Anulada',
      `La factura #${invoice.number} ha sido anulada. Razón: ${reason}`,
      { invoiceId: invoice._id, status: 'void' }
    );

    // Notificar al cliente si es diferente del creador
    if (invoice.customer && invoice.customer.email && invoice.customer.email !== req.user.email) {
      await createNotification(
        null, // Se enviará por correo
        'warning',
        'Factura Anulada',
        `La factura #${invoice.number} ha sido anulada. Razón: ${reason}`,
        { 
          invoiceId: invoice._id, 
          orderId: invoice.order,
          email: invoice.customer.email
        }
      );
    }

    res.json({
      success: true,
      message: 'Factura anulada correctamente',
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Error al anular factura:', error);
    next(error);
  }
};
