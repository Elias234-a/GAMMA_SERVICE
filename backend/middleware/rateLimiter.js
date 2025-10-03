import rateLimit from 'express-rate-limit';
import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';

// Create a MongoDB connection for the rate limiter
const mongoConn = mongoose.connection;

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// More sophisticated rate limiting for login attempts
const loginLimiter = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'login_fail',
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 15, // Block for 15 minutes after 5 failed attempts
});

// Middleware to limit login attempts
const loginRateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const username = req.body.email;
  const usernameIPkey = `${username}_${ip}`;

  try {
    await loginLimiter.consume(usernameIPkey);
    next();
  } catch (rlRejected) {
    if (rlRejected instanceof Error) {
      return next(rlRejected);
    }
    
    const retryAfter = Math.ceil(rlRejected.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: `Demasiados intentos fallidos. Intente nuevamente en ${retryAfter} segundos.`,
      retryAfter
    });
  }
};

// Rate limiter for password reset requests
const passwordResetLimiter = new RateLimiterMongo({
  storeClient: mongoConn,
  keyPrefix: 'password_reset',
  points: 3, // 3 attempts
  duration: 60 * 60, // Per hour
  blockDuration: 60 * 60, // Block for 1 hour after 3 attempts
});

// Middleware to limit password reset requests
const passwordResetRateLimiter = async (req, res, next) => {
  const ip = req.ip;
  
  try {
    await passwordResetLimiter.consume(ip);
    next();
  } catch (rlRejected) {
    if (rlRejected instanceof Error) {
      return next(rlRejected);
    }
    
    const retryAfter = Math.ceil(rlRejected.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes de restablecimiento de contraseña. Por favor, intente de nuevo más tarde.',
      retryAfter
    });
  }
};

export {
  apiLimiter,
  loginRateLimiter,
  passwordResetRateLimiter
};
