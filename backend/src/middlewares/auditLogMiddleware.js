const AuditLog = require('../models/AuditLog');

module.exports = async (req, res, next) => {
  // Log critical actions, but for now, it's in controllers for specificity
  next();
};