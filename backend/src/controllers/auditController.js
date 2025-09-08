const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().populate('userId').sort({ timestamp: -1 });
  res.json(logs);
};

