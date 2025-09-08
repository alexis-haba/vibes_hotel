const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', protect, role(['admin']), userController.getUsers);
router.post('/', protect, role(['admin']), userController.addUser);
router.put('/:id', protect, role(['admin']), userController.editUser);
router.delete('/:id', protect, role(['admin']), userController.deleteUser);

module.exports = router;