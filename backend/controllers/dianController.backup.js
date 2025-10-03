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
        total: (item.quantity * item.price) * (1 + (item.tax || 19) / 100)
      })),
      payment: {
        method: paymentMethod || '1', // 1: Contado, 2: Crédito
        terms: paymentMethod === '2' ? '30 días' : 'Contado'
      },
      subtotal,
      tax,
      total,
      notes: notes || `Factura generada para la orden ${orderId}`
    };

    // Enviar a la DIAN (modo pruebas o producción)
    let dianResponse;
    if (process.env.NODE_ENV === 'production' && company.dianEnabled) {
      const response = await dianClient.post('/invoices', invoiceData);
      dianResponse = response.data;
    } else {
      // En modo desarrollo o pruebas, simular respuesta
      dianResponse = {
        status: 'accepted',
        message: 'Factura recibida en modo de pruebas',
        uuid: invoiceData.id,
        cufe: `TEST-${invoiceData.id}`,
        qrCode: 'data:image/png;base64,...',
        pdfUrl: 'https://example.com/invoices/test.pdf',
        xmlUrl: 'https://example.com/invoices/test.xml'
      };
    }

    // Guardar factura en la base de datos
    const invoice = new Dian({
      ...invoiceData,
      order: orderId,
      company: company._id,
      dianResponse,
      status: dianResponse.status === 'accepted' ? 'accepted' : 'rejected',
      cufe: dianResponse.cufe,
      qrCode: dianResponse.qrCode,
      pdfUrl: dianResponse.pdfUrl,
      xmlUrl: dianResponse.xmlUrl
    });

    await invoice.save();

    // Actualizar orden con referencia a la factura
    order.invoice = invoice._id;
    order.invoiceStatus = invoice.status;
    await order.save();

    // Notificar al cliente
    await createNotification(
      order.client._id,
      'success',
      'Factura Generada',
      `Se ha generado la factura #${invoice.number} para su orden #${orderId}`,
      { invoiceId: invoice._id, orderId: order._id }
    );

    res.status(201).json({
      message: 'Factura generada exitosamente',
      invoice: {
        id: invoice._id,
        number: invoice.number,
        date: invoice.issueDate,
        total: invoice.total,
        status: invoice.status,
        cufe: invoice.cufe,
        pdfUrl: invoice.pdfUrl,
        xmlUrl: invoice.xmlUrl,
        qrCode: invoice.qrCode
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
      .populate('company', 'name taxId');

    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }

    // Verificar permisos
    if (invoice.company._id.toString() !== req.user.company?.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para ver esta factura' });
    }

    // En producción, consultar estado real en la DIAN
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await dianClient.get(`/invoices/${invoice.uuid}/status`);
        invoice.status = response.data.status;
        invoice.dianResponse = response.data;
        await invoice.save();
      } catch (error) {
        console.error('Error al consultar estado en DIAN:', error);
      }
    }

    res.json({
      id: invoice._id,
      number: invoice.number,
      status: invoice.status,
      cufe: invoice.cufe,
      issueDate: invoice.issueDate,
      total: invoice.total,
      order: invoice.order,
      company: invoice.company,
      pdfUrl: invoice.pdfUrl,
      xmlUrl: invoice.xmlUrl,
      qrCode: invoice.qrCode,
      lastUpdated: invoice.updatedAt
    });

  } catch (error) {
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
    if (invoice.company.toString() !== req.user.company?.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para descargar esta factura' });
    }

    // En producción, descargar de la URL de la DIAN
    if (invoice.pdfUrl && invoice.pdfUrl.startsWith('http')) {
      return res.redirect(invoice.pdfUrl);
    }
    
    // Si no hay URL, generar un PDF temporal (en un entorno real, usar una biblioteca como pdfkit)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${invoice.number}.pdf`);
    
    // Aquí iría la generación del PDF
    res.send('PDF generado para factura ' + invoice.number);
    
  } catch (error) {
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
    
    // Filtrar por empresa del usuario (si no es admin)
    if (req.user.role !== 'admin') {
      const company = await Company.findOne({ user: req.user._id });
      if (company) {
        query.company = company._id;
      } else {
        // Si el usuario no tiene compañía, solo puede ver sus propias facturas
        query['customer.email'] = req.user.email;
      }
    }
    
    // Filtros adicionales
    if (status) query.status = status;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.issueDate.$lte = end;
      }
    }
    
    const [invoices, total] = await Promise.all([
      Dian.find(query)
        .sort({ issueDate: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('order', 'number status')
        .populate('company', 'name taxId'),
      Dian.countDocuments(query)
    ]);
    
    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
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
    
    const invoice = await Dian.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' });
    }
    
    // Verificar que la factura no esté ya anulada
    if (invoice.status === 'void') {
      return res.status(400).json({ message: 'La factura ya está anulada' });
    }
    
    // En producción, notificar a la DIAN
    if (process.env.NODE_ENV === 'production') {
      try {
        await dianClient.post(`/invoices/${invoice.uuid}/void`, { reason });
      } catch (error) {
        console.error('Error al anular factura en DIAN:', error);
        return res.status(500).json({ 
          message: 'Error al anular la factura en la DIAN',
          error: error.message 
        });
      }
    }
    
    // Actualizar el estado de la factura
    invoice.status = 'void';
    invoice.notes = invoice.notes || [];
    invoice.notes.push({
      content: `Factura #${invoice.number} anulada: ${reason}`,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    const updatedInvoice = await invoice.save();
    
    // Notificar a los usuarios interesados
    await createNotification(
      invoice.createdBy,
      'info',
      'Factura Anulada',
      `La factura #${invoice.number} ha sido anulada`,
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
