/**
 * API Response Utility
 * Provides consistent response structure for all API endpoints
 */

/**
 * Success response
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Data to be sent in the response
 * @param {string} [message='Operación exitosa'] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {import('express').Response} - Express response object
 */
const success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} [error=null] - Error object or additional error details
 * @param {string} [code=null] - Custom error code
 * @returns {import('express').Response} - Express response object
 */
const error = (res, message, statusCode = 500, error = null, code = null) => {
  const response = {
    success: false,
    message,
    code: code || `ERR_${statusCode}`,
    ...(error && process.env.NODE_ENV !== 'production' && { error: error.message || error })
  };

  return res.status(statusCode).json(response);
};

/**
 * Not Found response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Recurso no encontrado'] - Error message
 * @returns {import('express').Response} - Express response object
 */
const notFound = (res, message = 'Recurso no encontrado') => {
  return error(res, message, 404, null, 'NOT_FOUND');
};

/**
 * Bad Request response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Solicitud incorrecta'] - Error message
 * @param {*} [errors=null] - Validation errors or additional error details
 * @returns {import('express').Response} - Express response object
 */
const badRequest = (res, message = 'Solicitud incorrecta', errors = null) => {
  const response = {
    success: false,
    message,
    code: 'BAD_REQUEST',
    ...(errors && { errors })
  };

  return res.status(400).json(response);
};

/**
 * Unauthorized response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='No autorizado'] - Error message
 * @returns {import('express').Response} - Express response object
 */
const unauthorized = (res, message = 'No autorizado') => {
  return error(res, message, 401, null, 'UNAUTHORIZED');
};

/**
 * Forbidden response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='No tiene permisos para realizar esta acción'] - Error message
 * @returns {import('express').Response} - Express response object
 */
const forbidden = (res, message = 'No tiene permisos para realizar esta acción') => {
  return error(res, message, 403, null, 'FORBIDDEN');
};

/**
 * Conflict response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Conflicto con el recurso'] - Error message
 * @returns {import('express').Response} - Express response object
 */
const conflict = (res, message = 'Conflicto con el recurso') => {
  return error(res, message, 409, null, 'CONFLICT');
};

/**
 * Validation Error response
 * @param {import('express').Response} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {string} [message='Error de validación'] - Error message
 * @returns {import('express').Response} - Express response object
 */
const validationError = (res, errors, message = 'Error de validación') => {
  return res.status(422).json({
    success: false,
    message,
    code: 'VALIDATION_ERROR',
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Paginated response
 * @param {import('express').Response} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} [message='Datos obtenidos correctamente'] - Success message
 * @returns {import('express').Response} - Express response object
 */
const paginated = (res, data, total, page, limit, message = 'Datos obtenidos correctamente') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null
    }
  });
};

module.exports = {
  success,
  error,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  validationError,
  paginated
};
