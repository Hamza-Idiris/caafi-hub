// middleware/errorHandler.js — Global Express error handler
const { error: sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal server error';

  // ── Mongoose: document not found ─────────────────────
  if (err.name === 'CastError') {
    statusCode = 404;
    message    = `Resource not found with id: ${err.value}`;
  }

  // ── Mongoose: duplicate key ───────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // ── Mongoose: validation error ────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = 'Validation failed';
    const errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return sendError(res, statusCode, message, errors);
  }

  // ── JWT errors ────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired.'; }

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err.stack);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
