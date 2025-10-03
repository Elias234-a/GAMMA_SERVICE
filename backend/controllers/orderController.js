import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Technician from '../models/Technician.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notifications.js';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from '../utils/emailService.js';
import { success, error as apiError, validationError } from '../utils/apiResponse.js';
import { upload, handleUploadErrors } from '../utils/fileUpload.js';
import path from 'path';
import { promises as fs } from 'fs';

// Status transition mapping with allowed next statuses
const STATUS_TRANSITIONS = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled', 'on_hold'],
  on_hold: ['in_progress', 'cancelled'],
  completed: [],
  cancelled: []
};

/**
 * Crea una nueva orden
 * @route POST /api/orders
 * @access private
 */
export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const orderData = {
      ...req.body,
      client: req.user._id,
      status: 'pending', // Ensure initial status
      createdBy: req.user._id
    };

    // Calculate total from items if not provided
    if (orderData.items && orderData.items.length > 0 && !orderData.total) {
      orderData.total = orderData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
    }

    const order = new Order(orderData);
    await order.save();

    // Populate for email
    const populatedOrder = await Order.findById(order._id)
      .populate('client', 'name email')
      .populate('technician', 'name email');

    // Notify client
    await createNotification(
      req.user._id,
      'success',
      'Orden Creada',
      `Su orden #${order.orderNumber || order._id} ha sido creada exitosamente`,
      { orderId: order._id }
    );

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(
        populatedOrder.client.email,
        populatedOrder.client.name,
        populatedOrder
      );
    } catch (emailError) {
      logger.error('Error sending order confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Order created: ${order._id} by user ${req.user._id}`);
    
    success(res, order, 'Orden creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todas las órdenes (con filtros)
 * @route GET /api/orders
 * @access private
 */
export const getOrders = async (req, res, next) => {
  try {
    const { 
      status, 
      client, 
      technician, 
      startDate, 
      endDate, 
      scheduledStart, 
      scheduledEnd, 
      minAmount, 
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Basic filters
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }
    
    if (client) query.client = client;
    if (technician) query.technician = technician;
    
    // Date range filters
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Scheduled date filters
    if (scheduledStart || scheduledEnd) {
      query.scheduledDate = {};
      if (scheduledStart) query.scheduledDate.$gte = new Date(scheduledStart);
      if (scheduledEnd) query.scheduledDate.$lte = new Date(scheduledEnd);
    }
    
    // Amount range filters
    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) query.total.$gte = parseFloat(minAmount);
      if (maxAmount) query.total.$lte = parseFloat(maxAmount);
    }
    
    // Text search
    if (search) {
      query.$or = [
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'technician.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'items.description': { $regex: search, $options: 'i' } }
      ];
    } else if (req.user.role !== 'admin') {
      // If not admin, only show own orders
      query.$or = [
        { client: req.user._id },
        { technician: req.user._id },
        { 'collaborators.user': req.user._id }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const [orders, count] = await Promise.all([
      Order.find(query)
        .populate('client', 'name email phone')
        .populate('technician', 'name specialty rating')
        .populate('createdBy', 'name email')
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);
    
    // Add calculated fields
    const ordersWithStats = orders.map(order => ({
      ...order,
      daysOpen: Math.ceil((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24)),
      isOverdue: order.dueDate && new Date() > new Date(order.dueDate) && !['completed', 'cancelled'].includes(order.status)
    }));
    
    // Return paginated response
    success(res, {
      data: ordersWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID with detailed information
 * @route GET /api/orders/:id
 * @access private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('technician', 'name email phone specialty rating')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name role avatar')
      .populate('attachments.uploadedBy', 'name')
      .populate('collaborators.user', 'name email role')
      .lean();
    
    if (!order) {
      return apiError(res, 'Orden no encontrada', 404);
    }
    
    // Check permissions
    const isClient = order.client?._id.toString() === req.user._id.toString();
    const isTechnician = order.technician?._id.toString() === req.user._id.toString();
    const isCollaborator = order.collaborators?.some(c => c.user._id.toString() === req.user._id.toString());
    
    if (req.user.role !== 'admin' && !isClient && !isTechnician && !isCollaborator) {
      return apiError(res, 'No autorizado para ver esta orden', 403);
    }
    
    // Add audit trail
    const auditLog = [
      {
        action: 'viewed',
        by: req.user._id,
        at: new Date(),
        userAgent: req.headers['user-agent']
      }
    ];
    
    // Update last viewed by
    await Order.findByIdAndUpdate(req.params.id, { 
      $addToSet: { 'auditLog': { $each: auditLog } },
      $set: { lastViewedBy: req.user._id, lastViewedAt: new Date() }
    });
    
    // Add related orders if client
    if (isClient || req.user.role === 'admin') {
      const relatedOrders = await Order.find({
        client: order.client._id,
        _id: { $ne: order._id },
        status: { $in: ['in_progress', 'pending'] }
      })
      .select('_id status description scheduledDate')
      .sort({ scheduledDate: 1 })
      .limit(5);
      
      order.relatedOrders = relatedOrders;
    }
    
    // Check if order is editable
    order.isEditable = ['pending', 'in_progress', 'on_hold'].includes(order.status);
    
    // Add available status transitions
    order.availableStatuses = STATUS_TRANSITIONS[order.status] || [];
    
    success(res, order);
    
  } catch (error) {
    logger.error(`Error getting order ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Update an order
 * @route PUT /api/orders/:id
 * @access private
 */
export const updateOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const orderId = req.params.id;
    const updates = req.body;
    const user = req.user;
    
    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return apiError(res, 'Orden no encontrada', 404);
    }
    
    // Check permissions
    const isAdmin = user.role === 'admin';
    const isClient = order.client.toString() === user._id.toString();
    const isTechnician = order.technician?.toString() === user._id.toString();
    
    if (!isAdmin && !isClient && !isTechnician) {
      await session.abortTransaction();
      session.endSession();
      return apiError(res, 'No autorizado para actualizar esta orden', 403);
    }
    
    // Track changes for audit log
    const changes = [];
    const oldValues = {};
    
    // Handle status change
    if (updates.status && updates.status !== order.status) {
      if (!STATUS_TRANSITIONS[order.status]?.includes(updates.status)) {
        await session.abortTransaction();
        session.endSession();
        return apiError(res, `Transición de estado no permitida: ${order.status} -> ${updates.status}`, 400);
      }
      
      oldValues.status = order.status;
      changes.push(`Estado cambiado de ${order.status} a ${updates.status}`);
      order.status = updates.status;
      
      // Add status change note
      order.notes.push({
        content: `Estado cambiado a ${updates.status}`,
        createdBy: user._id,
        isSystem: true
      });
      
      // Handle completion
      if (updates.status === 'completed') {
        order.completedAt = new Date();
        order.completedBy = user._id;
      }
    }
    
    // Handle technician assignment
    if (updates.technician && updates.technician !== order.technician?.toString()) {
      const newTechnician = await Technician.findById(updates.technician).session(session);
      if (!newTechnician) {
        await session.abortTransaction();
        session.endSession();
        return apiError(res, 'Técnico no encontrado', 404);
      }
      
      // Check technician availability
      const isAvailable = await newTechnician.isAvailableForJob(
        order.scheduledDate, 
        updates.estimatedDuration || 60
      );
      
      if (!isAvailable) {
        await session.abortTransaction();
        session.endSession();
        return apiError(res, 'El técnico no está disponible para esta orden', 400);
      }
      
      // Release old technician if exists
      if (order.technician) {
        const oldTechnician = await Technician.findById(order.technician).session(session);
        if (oldTechnician) {
          await oldTechnician.releaseOrder(order._id);
          await oldTechnician.save({ session });
          
          // Notify old technician
          await createNotification(
            oldTechnician.user,
            'info',
            'Orden Reasignada',
            `La orden #${order.orderNumber || order._id} te ha sido reasignada`,
            { orderId: order._id }
          );
        }
      }
      
      // Assign to new technician
      await newTechnician.assignOrder(order._id);
      await newTechnician.save({ session });
      
      oldValues.technician = order.technician;
      changes.push(`Técnico cambiado a ${newTechnician.name}`);
      order.technician = newTechnician._id;
      
      // Add assignment note
      order.notes.push({
        content: `Asignado al técnico ${newTechnician.name}`,
        createdBy: user._id,
        isSystem: true
      });
      
      // Notify new technician
      await createNotification(
        newTechnician.user,
        'info',
        'Nueva Orden Asignada',
        `Se te ha asignado la orden #${order.orderNumber || order._id}`,
        { orderId: order._id }
      );
    }
    
    // Handle other updates
    const allowedUpdates = [
      'description', 
      'items', 
      'priority', 
      'scheduledDate', 
      'dueDate',
      'estimatedDuration',
      'location',
      'billingInfo',
      'tags'
    ];
    
    for (const field of allowedUpdates) {
      if (updates[field] !== undefined && 
          JSON.stringify(updates[field]) !== JSON.stringify(order[field])) {
            
        oldValues[field] = order[field];
        order[field] = updates[field];
        changes.push(`Campo '${field}' actualizado`);
      }
    }
    
    // If items were updated, recalculate total
    if (updates.items) {
      order.total = order.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      changes.push('Total recalculado basado en los ítems actualizados');
    }
    
    // Add audit log entry if there are changes
    if (changes.length > 0) {
      order.auditLog.push({
        action: 'update',
        by: user._id,
        at: new Date(),
        changes,
        oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined
      });
      
      order.updatedBy = user._id;
      order.updatedAt = new Date();
      
      await order.save({ session });
      await session.commitTransaction();
      
      // Send notifications to interested parties
      await notifyOrderUpdate(order, user, changes);
      
      logger.info(`Order ${order._id} updated by user ${user._id}`, { changes });
      
      const updatedOrder = await Order.findById(orderId)
        .populate('client', 'name email')
        .populate('technician', 'name email')
        .populate('updatedBy', 'name');
      
      success(res, updatedOrder, 'Orden actualizada exitosamente');
    } else {
      await session.abortTransaction();
      success(res, order, 'No se realizaron cambios en la orden');
    }
    
    session.endSession();
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error updating order:', error);
    next(error);
  }
};

/**
 * Notify interested parties about order updates
 * @private
 */
async function notifyOrderUpdate(order, updatedBy, changes) {
  const recipients = new Set();
  
  // Always notify the client
  if (order.client) recipients.add(order.client.toString());
  
  // Notify the assigned technician if different from updater
  if (order.technician && order.technician.toString() !== updatedBy._id.toString()) {
    recipients.add(order.technician.toString());
  }
  
  // Notify collaborators
  if (order.collaborators && order.collaborators.length > 0) {
    order.collaborators.forEach(c => {
      if (c.user.toString() !== updatedBy._id.toString()) {
        recipients.add(c.user.toString());
      }
    });
  }
  
  // Convert to array and remove duplicates
  const recipientIds = [...recipients];
  
  // Send notifications in parallel
  await Promise.all(
    recipientIds.map(userId => 
      createNotification(
        userId,
        'info',
        `Orden #${order.orderNumber || order._id} Actualizada`,
        `La orden ha sido actualizada: ${changes.join(', ')}`,
        { 
          orderId: order._id,
          updatedBy: updatedBy._id,
          changes
        }
      )
    )
  );
}

/**
 * Delete an order (soft delete)
 * @route DELETE /api/orders/:id
 * @access private/admin
 */
export const deleteOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const orderId = req.params.id;
    const user = req.user;
    
    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return apiError(res, 'Orden no encontrada', 404);
    }
    
    // Check if order can be deleted
    if (order.status === 'in_progress' || order.status === 'completed') {
      await session.abortTransaction();
      session.endSession();
      return apiError(
        res, 
        `No se puede eliminar una orden en estado '${order.status}'. Cámbiala a 'cancelada' primero.`,
        400
      );
    }
    
    // Soft delete
    order.deleted = true;
    order.deletedAt = new Date();
    order.deletedBy = user._id;
    
    // Release technician if assigned
    if (order.technician) {
      const technician = await Technician.findById(order.technician).session(session);
      if (technician) {
        await technician.releaseOrder(order._id);
        await technician.save({ session });
      }
    }
    
    // Add audit log
    order.auditLog.push({
      action: 'delete',
      by: user._id,
      at: new Date(),
      reason: req.body.reason || 'Sin motivo especificado'
    });
    
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    
    // Notify client and technician
    await Promise.all([
      createNotification(
        order.client,
        'warning',
        'Orden Eliminada',
        `La orden #${order.orderNumber || order._id} ha sido eliminada`,
        { orderId: order._id, deletedBy: user._id }
      ),
      order.technician && createNotification(
        order.technician,
        'warning',
        'Orden Eliminada',
        `La orden #${order.orderNumber || order._id} ha sido eliminada`,
        { orderId: order._id, deletedBy: user._id }
      )
    ].filter(Boolean));
    
    logger.info(`Order ${order._id} soft-deleted by user ${user._id}`);
    
    success(res, null, 'Orden eliminada correctamente');
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logger.error('Error deleting order:', error);
    next(error);
  }
};

/**
 * Add a note to an order
 * @route POST /api/orders/:id/notes
 * @access private
 */
export const addNote = [
  // Validate input
  body('content')
    .trim()
    .notEmpty().withMessage('El contenido de la nota es requerido')
    .isLength({ max: 2000 }).withMessage('La nota no puede exceder los 2000 caracteres'),
  
  // Process request
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationError(res, errors.array());
      }
      
      const { content, isInternal = false } = req.body;
      const orderId = req.params.id;
      const user = req.user;
      
      const order = await Order.findById(orderId);
      if (!order) {
        return apiError(res, 'Orden no encontrada', 404);
      }
      
      // Check permissions
      const isAdmin = user.role === 'admin';
      const isClient = order.client.toString() === user._id.toString();
      const isTechnician = order.technician?.toString() === user._id.toString();
      const isCollaborator = order.collaborators?.some(c => c.user.toString() === user._id.toString());
      
      if (!isAdmin && !isClient && !isTechnician && !isCollaborator) {
        return apiError(res, 'No autorizado para agregar notas a esta orden', 403);
      }
      
      // Create note
      const note = {
        content,
        isInternal: isInternal && (isAdmin || isTechnician), // Only admins and technicians can add internal notes
        createdBy: user._id,
        createdAt: new Date()
      };
      
      order.notes.push(note);
      
      // Add to audit log
      order.auditLog.push({
        action: 'add_note',
        by: user._id,
        at: new Date(),
        noteId: note._id
      });
      
      await order.save();
      
      // Populate user info for response
      const populatedNote = {
        ...note.toObject ? note.toObject() : note,
        createdBy: {
          _id: user._id,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      };
      
      // Notify relevant users
      await notifyNewNote(order, note, user, isInternal);
      
      logger.info(`Note added to order ${order._id} by user ${user._id}`);
      
      success(res, populatedNote, 'Nota agregada correctamente', 201);
      
    } catch (error) {
      logger.error('Error adding note to order:', error);
      next(error);
    }
  }
];

/**
 * Upload attachments to an order
 * @route POST /api/orders/:id/attachments
 * @access private
 */
export const uploadAttachments = [
  // Handle file uploads
  upload.array('files', 5), // Max 5 files at once
  handleUploadErrors,
  
  // Process request
  async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const orderId = req.params.id;
      const user = req.user;
      const files = req.files || [];
      
      if (!files || files.length === 0) {
        return apiError(res, 'No se han subido archivos', 400);
      }
      
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        // Clean up uploaded files if order not found
        await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
        await session.abortTransaction();
        session.endSession();
        return apiError(res, 'Orden no encontrada', 404);
      }
      
      // Check permissions
      const isAdmin = user.role === 'admin';
      const isClient = order.client.toString() === user._id.toString();
      const isTechnician = order.technician?.toString() === user._id.toString();
      
      if (!isAdmin && !isClient && !isTechnician) {
        // Clean up uploaded files if not authorized
        await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
        await session.abortTransaction();
        session.endSession();
        return apiError(res, 'No autorizado para agregar archivos a esta orden', 403);
      }
      
      // Process each file
      const attachments = [];
      
      for (const file of files) {
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
        const filePath = path.join('uploads/orders', orderId.toString(), fileName);
        const fileDir = path.dirname(filePath);
        
        // Ensure directory exists
        await fs.mkdir(fileDir, { recursive: true });
        
        // Move file to permanent location
        await fs.rename(file.path, filePath);
        
        // Create attachment record
        const attachment = {
          name: file.originalname,
          path: filePath,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: user._id,
          uploadedAt: new Date()
        };
        
        order.attachments.push(attachment);
        attachments.push(attachment);
      }
      
      // Add to audit log
      order.auditLog.push({
        action: 'add_attachment',
        by: user._id,
        at: new Date(),
        count: files.length
      });
      
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      
      // Populate user info for response
      const populatedAttachments = attachments.map(att => ({
        ...att.toObject ? att.toObject() : att,
        uploadedBy: {
          _id: user._id,
          name: user.name,
          role: user.role
        },
        // Generate signed URL for download (if using S3 or similar)
        url: `/api/orders/${orderId}/attachments/${att._id}/download`
      }));
      
      // Notify relevant users
      await notifyNewAttachments(order, populatedAttachments, user);
      
      logger.info(`${files.length} attachments added to order ${order._id} by user ${user._id}`);
      
      success(res, populatedAttachments, 'Archivos subidos correctamente', 201);
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      // Clean up any uploaded files on error
      if (req.files && req.files.length > 0) {
        await Promise.all(
          req.files.map(file => 
            fs.unlink(file.path).catch(() => {})
          )
        );
      }
      
      logger.error('Error uploading order attachments:', error);
      next(error);
    }
  }
];

/**
 * Download an order attachment
 * @route GET /api/orders/:orderId/attachments/:attachmentId/download
 * @access private
 */
export const downloadAttachment = async (req, res, next) => {
  try {
    const { orderId, attachmentId } = req.params;
    const user = req.user;
    
    const order = await Order.findOne({
      _id: orderId,
      'attachments._id': attachmentId
    }).select('client technician attachments.$');
    
    if (!order) {
      return apiError(res, 'Archivo no encontrado', 404);
    }
    
    const attachment = order.attachments.find(a => a._id.toString() === attachmentId);
    if (!attachment) {
      return apiError(res, 'Archivo no encontrado', 404);
    }
    
    // Check permissions
    const isAdmin = user.role === 'admin';
    const isClient = order.client.toString() === user._id.toString();
    const isTechnician = order.technician?.toString() === user._id.toString();
    
    if (!isAdmin && !isClient && !isTechnician) {
      return apiError(res, 'No autorizado para descargar este archivo', 403);
    }
    
    // Check if file exists
    try {
      await fs.access(attachment.path);
    } catch (err) {
      logger.error(`Attachment file not found: ${attachment.path}`, { error: err });
      return apiError(res, 'El archivo solicitado no existe en el servidor', 404);
    }
    
    // Set headers for download
    res.set({
      'Content-Type': attachment.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.name)}"`,
      'Content-Length': attachment.size,
      'Cache-Control': 'private, max-age=3600'
    });
    
    // Stream the file
    const fileStream = fs.createReadStream(attachment.path);
    fileStream.pipe(res);
    
    // Log download
    await Order.updateOne(
      { _id: orderId, 'attachments._id': attachmentId },
      { 
        $push: { 
          'attachments.$.downloads': {
            by: user._id,
            at: new Date(),
            userAgent: req.headers['user-agent']
          }
        }
      }
    );
    
    logger.info(`Attachment ${attachmentId} downloaded by user ${user._id}`);
    
  } catch (error) {
    logger.error('Error downloading attachment:', error);
    next(error);
  }
};

/**
 * Get order statistics
 * @route GET /api/orders/statistics
 * @access private/admin
 */
export const getOrderStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    // Date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Base match query
    const match = {};
    if (Object.keys(dateFilter).length > 0) {
      match.createdAt = dateFilter;
    }
    
    // Group by period
    let groupId;
    const dateFormat = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    };
    
    if (groupBy === 'month') {
      groupId = {
        year: dateFormat.year,
        month: dateFormat.month
      };
    } else if (groupBy === 'year') {
      groupId = {
        year: dateFormat.year
      };
    } else { // Default to day
      groupId = {
        year: dateFormat.year,
        month: dateFormat.month,
        day: dateFormat.day
      };
    }
    
    // Aggregate query
    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          averageAmount: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format dates for response
    const formattedStats = stats.map(stat => {
      const { _id, ...rest } = stat;
      let date;
      
      if (_id.day) {
        date = new Date(_id.year, _id.month - 1, _id.day).toISOString().split('T')[0];
      } else if (_id.month) {
        date = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      } else {
        date = String(_id.year);
      }
      
      return {
        date,
        ...rest
      };
    });
    
    // Get status counts
    const statusCounts = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top clients
    const topClients = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$client',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'clientInfo'
        }
      },
      { $unwind: '$clientInfo' },
      {
        $project: {
          _id: 0,
          clientId: '$_id',
          clientName: '$clientInfo.name',
          clientEmail: '$clientInfo.email',
          orderCount: 1,
          totalSpent: 1
        }
      }
    ]);
    
    // Get technician performance
    const technicianPerformance = await Order.aggregate([
      { 
        $match: { 
          ...match,
          technician: { $exists: true, $ne: null } 
        } 
      },
      {
        $group: {
          _id: '$technician',
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalOrders: { $sum: 1 },
          averageCompletionTime: { $avg: { $subtract: ['$completedAt', '$createdAt'] } },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { completedOrders: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'technicians',
          localField: '_id',
          foreignField: '_id',
          as: 'techInfo'
        }
      },
      { $unwind: '$techInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'techInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          technicianId: '$_id',
          technicianName: '$userInfo.name',
          completedOrders: 1,
          totalOrders: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedOrders', '$totalOrders'] },
              100
            ]
          },
          averageCompletionTime: 1,
          totalRevenue: 1
        }
      }
    ]);
    
    success(res, {
      timeline: formattedStats,
      statusCounts,
      topClients,
      technicianPerformance,
      dateRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
        groupBy
      }
    });
    
  } catch (error) {
    logger.error('Error getting order statistics:', error);
    next(error);
  }
};

/**
 * Helper function to notify about new notes
 * @private
 */
async function notifyNewNote(order, note, createdBy, isInternal) {
  const recipients = new Set();
  
  // Always notify the client unless it's an internal note
  if (!isInternal && order.client) {
    recipients.add(order.client.toString());
  }
  
  // Notify the assigned technician if different from note creator
  if (order.technician && order.technician.toString() !== createdBy._id.toString()) {
    recipients.add(order.technician.toString());
  }
  
  // Notify other users who have added notes
  const noteAuthors = order.notes
    .filter(n => n.createdBy.toString() !== createdBy._id.toString())
    .map(n => n.createdBy.toString());
  
  noteAuthors.forEach(authorId => recipients.add(authorId));
  
  // Notify collaborators
  if (order.collaborators && order.collaborators.length > 0) {
    order.collaborators.forEach(c => {
      if (c.user.toString() !== createdBy._id.toString()) {
        recipients.add(c.user.toString());
      }
    });
  }
  
  // Convert to array and remove duplicates
  const recipientIds = [...recipients];
  
  // Send notifications in parallel
  await Promise.all(
    recipientIds.map(userId => 
      createNotification(
        userId,
        'info',
        `Nueva Nota en Orden #${order.orderNumber || order._id}`,
        isInternal 
          ? 'Se ha agregado una nueva nota interna a la orden' 
          : `Nuevo comentario en la orden por ${createdBy.name}`,
        { 
          orderId: order._id,
          noteId: note._id,
          isInternal
        }
      )
    )
  );
}

/**
 * Helper function to notify about new attachments
 * @private
 */
async function notifyNewAttachments(order, attachments, uploadedBy) {
  const recipients = new Set();
  
  // Always notify the client
  if (order.client) recipients.add(order.client.toString());
  
  // Notify the assigned technician if different from uploader
  if (order.technician && order.technician.toString() !== uploadedBy._id.toString()) {
    recipients.add(order.technician.toString());
  }
  
  // Notify collaborators
  if (order.collaborators && order.collaborators.length > 0) {
    order.collaborators.forEach(c => {
      if (c.user.toString() !== uploadedBy._id.toString()) {
        recipients.add(c.user.toString());
      }
    });
  }
  
  // Convert to array and remove duplicates
  const recipientIds = [...recipients];
  
  // Send notifications in parallel
  await Promise.all(
    recipientIds.map(userId => 
      createNotification(
        userId,
        'info',
        `Nuevos Archivos en Orden #${order.orderNumber || order._id}`,
        `Se han agregado ${attachments.length} archivos a la orden`,
        { 
          orderId: order._id,
          fileCount: attachments.length,
          uploadedBy: uploadedBy._id
        }
      )
    )
  );
}

