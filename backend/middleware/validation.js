const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to handle validation errors from express-validator
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { 
      path: req.path, 
      method: req.method,
      errors: errors.array() 
    });
    
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validates MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Middleware to validate MongoDB ObjectId in request parameters
 * @param {string} paramName - Name of the parameter to validate
 * @returns {import('express').RequestHandler} - Express middleware function
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid ObjectId: ${id}`, { 
        paramName, 
        path: req.path, 
        method: req.method 
      });
      
      return res.status(400).json({
        success: false,
        message: 'ID no válido',
        field: paramName,
        value: id
      });
    }
    
    next();
  };
};

/**
 * Validates if the user has the required role
 * @param {string|string[]} roles - Role or array of roles that are allowed
 * @returns {import('express').RequestHandler} - Express middleware function
 */
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check failed: No user in request', { 
        path: req.path, 
        method: req.method 
      });
      
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role check failed: Insufficient permissions', { 
        path: req.path, 
        method: req.method,
        userRole: req.user.role,
        requiredRoles: roles
      });
      
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Validates if the request has a valid content type
 * @param {string} type - Expected content type (e.g., 'application/json')
 * @returns {import('express').RequestHandler} - Express middleware function
 */
const validateContentType = (type) => {
  return (req, res, next) => {
    if (req.get('content-type') !== type) {
      logger.warn('Invalid content type', { 
        expected: type, 
        received: req.get('content-type'),
        path: req.path,
        method: req.method
      });
      
      return res.status(415).json({
        success: false,
        message: `El tipo de contenido debe ser ${type}`
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  hasRole,
  validateContentType,
  isValidObjectId
};
