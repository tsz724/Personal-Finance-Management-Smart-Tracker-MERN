const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get dashboard data for the logged in user
router.get('/', protect, getDashboardData);

module.exports = router;