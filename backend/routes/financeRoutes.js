const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getIncomes, addIncome, downloadexcel: downloadIncomeExcel, deleteIncome } = require('../controllers/incomeController');
const { getexpenses, addexpense, downloadexcel: downloadExpenseExcel, deleteExpense } = require('../controllers/expenseController');
const { getDashboardData } = require('../controllers/dashboardController');
const {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/incomeCategoryController');
const {
    listCategories: listExpenseCategories,
    createCategory: createExpenseCategory,
    updateCategory: updateExpenseCategory,
    deleteCategory: deleteExpenseCategory,
} = require('../controllers/expenseCategoryController');

const router = express.Router();

// Finance module dashboard
router.get('/dashboard', protect, getDashboardData);

// Income categories
router.get('/income-categories', protect, listCategories);
router.post('/income-categories', protect, createCategory);
router.put('/income-categories/:id', protect, updateCategory);
router.delete('/income-categories/:id', protect, deleteCategory);

// Expense categories
router.get('/expense-categories', protect, listExpenseCategories);
router.post('/expense-categories', protect, createExpenseCategory);
router.put('/expense-categories/:id', protect, updateExpenseCategory);
router.delete('/expense-categories/:id', protect, deleteExpenseCategory);

// Income endpoints
router.get('/income', protect, getIncomes);
router.post('/income', protect, addIncome);
router.get('/income/download', protect, downloadIncomeExcel);
router.delete('/income/:id', protect, deleteIncome);

// Expense endpoints
router.get('/expense', protect, getexpenses);
router.post('/expense', protect, addexpense);
router.get('/expense/download', protect, downloadExpenseExcel);
router.delete('/expense/:id', protect, deleteExpense);

module.exports = router;
