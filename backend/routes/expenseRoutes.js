const express = require('express');
const {
  addexpense,
  getexpenses,
  deleteExpense,
  downloadexcel
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get expenses of the logged in user
router.get('/get', protect, getexpenses);
// Add expense for the logged in user
router.post('/add', protect, addexpense);

// Delete expense by id
router.delete('/delete/:id', protect, deleteExpense);

// Download expense data as excel file
router.get('/downloadexcel', protect, downloadexcel);

module.exports = router;