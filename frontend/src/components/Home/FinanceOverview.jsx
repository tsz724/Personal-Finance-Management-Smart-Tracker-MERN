import React from 'react';
import CustomPieChart from '../Charts/CustomPieChart';

const colors=['#10b981','#ef4444','#2563EB'] //green,red,blue

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  // Calculate data for the donut chart
  const chartData = [
    { name: 'Income', value: totalIncome},
    { name: 'Expense', value: totalExpense},
    { name: 'Balance', value: Math.max(totalBalance, 0)},
  ];

  // Filter out zero values for cleaner chart
  const filteredData = chartData.filter(item => item.value > 0);

  return (
    <div className="card col-span-1 p-6">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold">Financial Overview</h5>
      </div>

      <CustomPieChart
        data={filteredData}
        label="Total Balance"
        totalAmount={`₹${totalBalance}`}
        colors={colors}
        showTextAnchor
      />
    </div>
  );
}

export default FinanceOverview;

