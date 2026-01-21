const XLSX = require('xlsx');
const Income = require('../models/Income');

//Get incomes of the logged in user
exports.getIncomes = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ user: userId }).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Add income for the logged in user
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, amount, source, date } = req.body;

        //validation
        if (!date || !amount || !source) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const income = new Income({
            user: userId,
            icon,
            amount,
            source,
            date
        });
        
        await income.save();
        res.status(201).json({ message: 'Income added successfully', income });
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'Server error' });        
    }
};

//Download income data as excel file
exports.downloadexcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ user: userId }).sort({ date: -1 });
        
        //Prepare data for excel
        const excelData = incomes.map(income => ({
            Date: income.date.toISOString().split('T')[0],
            Source: income.source,
            Amount: income.amount,
        }));

        const wb= XLSX.utils.book_new();
        const ws= XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Incomes');
        XLSX.writeFile(wb, 'incomes.xlsx');
        res.download('incomes.xlsx');
    } catch (error) {
        console.error('Error downloading income excel:', error);
        res.status(500).json({ message: 'Server error' });
    }   
};

//Delete income by id
exports.deleteIncome = async (req, res) => {
    try{
        await Income.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Income deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
