import React, { useState, useEffect } from 'react';
import Custombarchart from '../Charts/Custombarchart';

const ExpensesLast60days = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  const prepareExpenseBarChartData = (rawItems = []) => {
    if (!rawItems || rawItems.length === 0) return;

    const groups = rawItems.reduce((acc, item) => {
      const dateKey = item?.date ? new Date(item.date).toISOString().split('T')[0] : 'Unknown';
      
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey] += item?.amount || 0;
      return acc;
    }, {});

    const formattedData = Object.keys(groups)
      .map((date) => ({
        date,
        amount: groups[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setChartData(formattedData);
  };

  useEffect(() => {
    prepareExpenseBarChartData(data);
  }, [data]);

  return (
    <div className="card col-span-1 p-6 min-h-100">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold text-gray-800">Last 60 days Expense</h5>
      </div>
      {chartData.length > 0 ? (
        <Custombarchart data={chartData}/>
      ) : (
        <div className="flex h-75 items-center justify-center text-gray-400">
          No expense data found for this period.
        </div>
      )}
    </div>
  );
};

export default ExpensesLast60days;