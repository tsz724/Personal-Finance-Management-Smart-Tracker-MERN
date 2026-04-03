const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/active', adminController.setUserActive);
router.get('/stats', adminController.stats);

module.exports = router;
