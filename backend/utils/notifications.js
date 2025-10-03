import Notification from '../models/Notification.js';

/**
 * Crea una nueva notificación para un usuario
 * @param {string} userId - ID del usuario destinatario
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {string} title - Título de la notificación
 * @param {string} message - Mensaje de la notificación
 * @param {Object} [metadata] - Metadatos adicionales
 * @returns {Promise<Object>} - La notificación creada
 */
export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      metadata,
      read: false
    });
    
    await notification.save();
    
    // Aquí podrías implementar notificaciones en tiempo real con WebSockets
    // Ejemplo: io.to(`user_${userId}`).emit('new_notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<Object>} - La notificación actualizada
 */
export const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true, readAt: new Date() },
    { new: true }
  );
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
};

/**
 * Obtiene las notificaciones no leídas de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} [limit=10] - Límite de notificaciones a devolver
 * @returns {Promise<Array>} - Lista de notificaciones no leídas
 */
export const getUnreadNotifications = async (userId, limit = 10) => {
  return await Notification.find({ user: userId, read: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Obtiene el historial de notificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} [page=1] - Número de página
 * @param {number} [limit=20] - Cantidad de notificaciones por página
 * @returns {Promise<Object>} - Objeto con las notificaciones y metadatos de paginación
 */
export const getNotificationHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: userId })
  ]);
  
  return {
    notifications,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

