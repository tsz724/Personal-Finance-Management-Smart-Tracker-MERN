const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    icon: {
        type: String,
    },
    amount: {
        type: Number,
        required: true
    },
    expenseCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
    },
    category: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);