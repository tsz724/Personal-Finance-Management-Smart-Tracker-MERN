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
        const income = await Income.find({ user: userId }).sort({ date: -1 });
    
        const excelData = income.map(income => ({
          Date: income.date.toISOString().split("T")[0],
          Source: income.source,
          Amount: income.amount, 
        }));
    
    
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
    
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let row = range.s.r + 1; row <= range.e.r; row++) {
          const amountCell = ws[XLSX.utils.encode_cell({ r: row, c: 2 })];
          if (amountCell) {
            amountCell.t = "n";
            amountCell.z = '$#,##0.00';
          }
        }
    
        XLSX.utils.book_append_sheet(wb, ws, "Income");
    
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().slice(0, 5).replace(":", "-");
        const fileName = `income_details_${date}_${time}.xlsx`;
    
    
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
        console.error("Error downloading income excel:", error);
        res.status(500).json({ message: "Server error" });
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
