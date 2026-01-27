import React, { useEffect, useState } from 'react';
import CustomPieChart from '../Charts/CustomPieChart';

const colors=['#10b981'] //green

const IncomeLast60Days = ({ income, totalincome }) => {

  const [chartData, setChartData] = useState([]);

  const prepareChartData = () => {
    const dataArr = income?.map((item) => ({
      name: item?.source,
      value: item?.amount,
    }));

    setChartData(dataArr);
  };

  useEffect(() => {
    prepareChartData();

    return () => {};
  }, [income]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold">Last 60 Days Income</h5>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`$${totalincome}`}
        showTextAnchor
        colors={colors} 
      />
    </div>
  );
};

export default IncomeLast60Days;