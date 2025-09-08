const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/', protect, role(['admin', 'employee']), expenseController.addExpense); // Employés peuvent ajouter
router.get('/', protect, role(['admin', 'employee']), expenseController.getExpenses); // Employés peuvent voir

module.exports = router;