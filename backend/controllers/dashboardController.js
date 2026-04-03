const Income = require('../models/Income');
const Expense = require('../models/Expense');
const {isValidObjectId,Types} = require('mongoose');

//Get dashboard data for the logged in user
exports.getDashboardData = async (req, res) => {
    try {   
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        //Fetch total income and expenses using aggregation
        const totalincome = await Income.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
        ]);
        
        const totalexpenses = await Expense.aggregate([
            { $match: { user: userObjectId } },
            { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
        ]);
        //Get income transaction for the last 60 days
        const incomeTransactions = await Income.find({
            user: userId,
            date: { $gte: new Date(Date.now() - 60*24*60*60*1000) }
        })
            .populate('category', 'name icon')
            .sort({ date: -1 });

        //Get total income for last 60 days
        const totalIncomeLast60Days = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

        //Get expense transaction for the last 60 days
        const expenseTransactions = await Expense.find({
            user: userId,
            date: { $gte: new Date(Date.now() - 60*24*60*60*1000) }
        })
            .populate('expenseCategory', 'name icon')
            .sort({ date: -1 });

        //Get total expenses for last 60 days
        const totalExpensesLast60Days = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
        
        //Fetch last 5 income and expense transactions
        const recentTransactions=[
            ...(await Income.find({ user: userId })
                .populate('category', 'name icon')
                .sort({ date: -1 })
                .limit(5)
            ).map(
                (txn)=>({ ...txn.toObject(), type: 'income' })
            ),
            ...(await Expense.find({ user: userId })
                .populate('expenseCategory', 'name icon')
                .sort({ date: -1 })
                .limit(5)
            ).map(
                (txn)=>({ ...txn.toObject(), type: 'expense' })
            ),
        ].sort((a,b)=>b.date - a.date);

        res.status(200).json({
            totalBalance: (totalincome[0]?.totalIncome || 0) - (totalexpenses[0]?.totalExpenses || 0),
            totalincome: totalincome[0]?.totalIncome || 0,
            totalexpenses: totalexpenses[0]?.totalExpenses || 0,
            totalIncomeLast60Days:{
                total: totalIncomeLast60Days,
                transactions: incomeTransactions
            },
            totalExpensesLast60Days:{
                total: totalExpensesLast60Days,
                transactions: expenseTransactions
            },
            recentTransactions: recentTransactions
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};