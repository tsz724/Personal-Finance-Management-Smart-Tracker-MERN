const express = require('express');
const financeRoutes = require('./financeRoutes');

const router = express.Router();

// Future module namespace
router.use('/finance', financeRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Business management modules',
    modules: ['finance', 'workspaces', 'jobs', 'projects', 'work-items', 'email', 'employees', 'calendar'],
    businessApi: '/api/business',
    adminApi: '/api/admin',
  });
});

module.exports = router;
