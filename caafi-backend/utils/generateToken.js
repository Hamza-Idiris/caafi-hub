// utils/generateToken.js — JWT creation helper
const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given payload.
 * @param {object} payload  - Data to embed (id, role, etc.)
 * @returns {string} signed JWT
 */
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

module.exports = generateToken;
