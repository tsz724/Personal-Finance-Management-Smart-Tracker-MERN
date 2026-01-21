const XLSX = require('xlsx');
const Expense= require('../models/Expense');

//Get expenses of the logged in user
exports.getexpenses = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
//Add expense for the logged in user
exports.addexpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, amount, category, date } = req.body;

        //validation
        if (!date || !amount || !category) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const expense = new Expense({
            user: userId,
            icon,
            amount,
            category,
            date
        });
        
        await expense.save();
        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error' });  
    }   
};
//Delete expense by id
exports.deleteExpense = async (req, res) => {
    try {
       await Expense.findByIdAndDelete(req.params.id);
         res.status(200).json({ message: 'Expense deleted successfully' }); 
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Download expense data as excel file
exports.downloadexcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ user: userId }).sort({ createdAt: -1 });
        
        //Prepare data for excel
        const excelData = expenses.map(expense => ({
            Date: expense.date.toISOString().split('T')[0],
            Category: expense.category,
            Amount: expense.amount,
        }));

        const wb= XLSX.utils.book_new();
        const ws= XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        XLSX.writeFile(wb, 'expenses.xlsx');
        res.download('expenses.xlsx');
    } catch (error) {
        console.error('Error downloading expense excel:', error);
        res.status(500).json({ message: 'Server error' });
    }
};