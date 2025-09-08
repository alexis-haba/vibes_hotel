const express = require('express');
const router = express.Router();
const { createEntry, getEntries } = require('../controllers/entryController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createEntry);
router.get('/', protect, getEntries);

module.exports = router;
