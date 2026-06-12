// utils/apiResponse.js — Standardised JSON response helpers

/**
 * Send a success response.
 * @param {object} res   - Express response object
 * @param {number} code  - HTTP status code (default 200)
 * @param {string} msg   - Human-readable message
 * @param {*}      data  - Payload (any serialisable value)
 * @param {object} meta  - Optional pagination / extra metadata
 */
const success = (res, code = 200, msg = 'Success', data = null, meta = null) => {
  const body = { success: true, message: msg };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(code).json(body);
};

/**
 * Send an error response.
 */
const error = (res, code = 500, msg = 'Server error', errors = null) => {
  const body = { success: false, message: msg };
  if (errors !== null) body.errors = errors;
  return res.status(code).json(body);
};

module.exports = { success, error };
