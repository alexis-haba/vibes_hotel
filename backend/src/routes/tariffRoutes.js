const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');
const { protect } = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/', protect, role(['employee', 'admin']), tariffController.getTariff); // Autorise 'employee' et 'admin'
router.put('/', protect, role(['admin']), tariffController.updateTariff);

module.exports = router;