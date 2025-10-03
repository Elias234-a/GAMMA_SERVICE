import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Error al verificar la configuración del correo:', error);
  } else {
    console.log('Servidor de correo listo para enviar mensajes');
  }
});

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

/**
 * Send an email using a template
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} template - Template name (without .ejs extension)
 * @param {object} data - Data to be passed to the template
 * @returns {Promise<object>} - Result of the sendMail operation
 */
export const sendEmail = async (to, subject, template, data = {}) => {
  try {
    // Read the email template
    const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Render the email template with the provided data
    const html = ejs.render(templateContent, {
      ...data,
      year: new Date().getFullYear(),
      appName: process.env.APP_NAME || 'Tu Aplicación'
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Equipo'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Convert HTML to plain text
    });

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
};

/**
 * Send a welcome email to a new user
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} token - Verification token
 * @returns {Promise<object>} - Result of the sendEmail operation
 */
export const sendWelcomeEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return sendEmail(
    email,
    '¡Bienvenido a Gamma Service!',
    'welcome',
    { name, verificationUrl }
  );
};

/**
 * Send a password reset email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} token - Reset token
 * @returns {Promise<object>} - Result of the sendEmail operation
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  return sendEmail(
    email,
    'Restablecer contraseña - Gamma Service',
    'password-reset',
    {
      name,
      resetUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'soporte@gammaservice.com',
      companyName: 'Gamma Service'
    }
  );
};

/**
 * Send an order confirmation email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {object} order - Order details
 * @returns {Promise<object>} - Result of the sendEmail operation
 */
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}`;
  
  return sendEmail(
    email,
    `Confirmación de orden #${order.orderNumber || order._id}`,
    'order-confirmation',
    {
      name,
      order: {
        ...order,
        orderNumber: order.orderNumber || order._id,
        orderUrl,
        orderDate: new Date(order.createdAt || Date.now()).toLocaleDateString()
      }
    }
  );
};

/**
 * Send a new order notification to admin/technicians
 * @param {string} email - Recipient email address
 * @param {string} technicianName - Technician's name
 * @param {object} order - Order details
 * @param {string} adminName - Admin's name (optional)
 * @returns {Promise<object>} - Result of the sendEmail operation
 */
export const sendNewOrderNotification = async (email, technicianName, order, adminName = null) => {
  const subject = adminName 
    ? `Nueva Orden Asignada - ${order.orderNumber}`
    : `Nuevo Trabajo Asignado - Orden #${order.orderNumber}`;

  const template = adminName ? 'admin-new-order' : 'tech-new-order';
  
  return sendEmail(
    email,
    subject,
    template,
    {
      name: adminName || technicianName,
      order,
      adminName,
      technicianName
    }
  );
};

/**
 * Send an order status update email
 * @param {string} email - Recipient email address
 * @param {string} customerName - Customer's name
 * @param {object} order - Order details
 * @param {string} oldStatus - Previous order status
 * @param {string} newStatus - New order status
 * @param {string} [notes] - Additional notes about the status update
 */
export const sendStatusUpdateEmail = async (email, customerName, order, oldStatus, newStatus, notes = '') => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
  };

  const subject = `Actualización de Estado - Orden #${order.orderNumber || order._id.toString().substring(18, 24)}`;
  
  return sendEmail(
    email,
    subject,
    'status-update',
    {
      name: customerName,
      orderNumber: order.orderNumber || order._id.toString().substring(18, 24),
      oldStatus: statusMap[oldStatus] || oldStatus,
      newStatus: statusMap[newStatus] || newStatus,
      notes,
      orderDetails: {
        serviceType: order.serviceType,
        description: order.description,
        createdAt: order.createdAt?.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      contactEmail: process.env.SUPPORT_EMAIL || 'soporte@ejemplo.com',
      contactPhone: process.env.SUPPORT_PHONE || '+57 123 456 7890'
    }
  );
}
