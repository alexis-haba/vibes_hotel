const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect } = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/', protect, role(['admin']), auditController.getAuditLogs);

module.exports = router;