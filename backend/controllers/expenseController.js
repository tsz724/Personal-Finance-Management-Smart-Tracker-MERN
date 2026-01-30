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
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    const excelData = expenses.map(expense => ({
      Date: expense.date.toISOString().split("T")[0],
      Category: expense.category,
      Amount: expense.amount, 
    }));


    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const amountCell = ws[XLSX.utils.encode_cell({ r: row, c: 2 })];
      if (amountCell) {
        amountCell.t = "n";
        amountCell.z = '₹#,##0.00';
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5).replace(":", "-");
    const fileName = `expense_details_${date}_${time}.xlsx`;


    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Disposition"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error downloading expense excel:", error);
    res.status(500).json({ message: "Server error" });
  }
};