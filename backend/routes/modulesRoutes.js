const express = require('express');
const financeRoutes = require('./financeRoutes');

const router = express.Router();

// Future module namespace
router.use('/finance', financeRoutes);

// stub for future modules
router.get('/', (req, res) => {
  res.json({ message: 'Modules endpoint. Available modules: finance' });
});

module.exports = router;
