import React, { useState, useEffect } from 'react';
import { LuPlus } from "react-icons/lu";
import Custombarchart from '../Charts/Custombarchart';

const IncomeOverview = ({ transactions, onAddIncome }) => {
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
    prepareExpenseBarChartData(transactions);

    return () => {};
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="">
          <h5 className="text-lg font-semibold">Income Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your earnings over time and analyze your income trends.
          </p>
        </div>

        <button className="add-btn" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>

      <div className="mt-10">
        <Custombarchart data={chartData}/>
      </div>
    </div>
  );
}

export default IncomeOverview;