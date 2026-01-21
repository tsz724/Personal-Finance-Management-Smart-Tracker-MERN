const express = require('express');

const { getIncomes, addIncome, downloadexcel, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

//Get income of the logged in user
router.get('/get', protect, getIncomes);
//Add income for the logged in user
router.post('/add', protect, addIncome);
//Download income data as excel file
router.get('/downloadexcel', protect, downloadexcel);
//Delete income by id
router.delete('/delete/:id', protect, deleteIncome);

module.exports = router;