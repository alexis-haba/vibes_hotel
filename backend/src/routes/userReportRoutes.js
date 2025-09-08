// backend/src/routes/userReportRoutes.js
const express = require('express');
const router = express.Router();
const userReportController = require('../controllers/userReportController');
const { protect } = require('../middlewares/authMiddleware');

// Seulement le résumé du jour
router.get('/daily', protect, userReportController.getUserDailySummary);

module.exports = router;
