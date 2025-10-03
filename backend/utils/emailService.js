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
const sendEmail = async (to, subject, template, data = {}) => {
  try {
    // Read the email template
    const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Render the email template with the provided data
    const html = ejs.render(templateContent, { 
      ...data,
      year: new Date().getFullYear(),
      appName: process.env.APP_NAME || 'Gamma Service'
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Gamma Service'}" <${process.env.SMTP_FROM || 'no-reply@gamma-service.com'}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
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
const sendWelcomeEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return sendEmail(
    email,
    '¡Bienvenido a Gamma Service!',
    'welcome',
    { 
      name,
      verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'soporte@gamma-service.com'
    }
  );
};

/**
 * Send a password reset email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} token - Reset token
 * @returns {Promise<object>} - Result of the sendEmail operation
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  return sendEmail(
    email,
    'Restablecer contraseña - Gamma Service',
    'password-reset',
    { 
      name,
      resetUrl,
      expiresIn: '24 horas'
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
const sendOrderConfirmationEmail = async (email, name, order) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}`;
  
  return sendEmail(
    email,
    `Confirmación de orden #${order.orderNumber || order._id}`,
    'order-confirmation',
    { 
      name,
      order: {
        ...order.toObject(),
        orderUrl,
        formattedDate: new Date(order.createdAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
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
const sendNewOrderNotification = async (email, technicianName, order, adminName = null) => {
  const subject = adminName 
    ? `Nueva Orden Asignada - ${order.orderNumber}`
    : `Nuevo Trabajo Asignado - Orden #${order.orderNumber}`;

  return sendEmail(
    email,
    subject,
    'new-order-notification',
    {
      name: adminName || technicianName,
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      serviceType: order.serviceType,
      description: order.description,
      status: order.status,
      createdAt: order.createdAt,
      isAdmin: !!adminName,
      adminName,
      technicianName
    }
  );
};

export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
  sendNewOrderNotification
};
