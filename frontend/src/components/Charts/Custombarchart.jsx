import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Custombarchart = ({ data }) => {

  // Function to alternate colors
  const getBarColor = (index) => {
    return index % 2 === 0 ? "#875cf5" : "#cfbefb";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-purple-800 mb-1">
            {new Date(payload[0].payload.date).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', year: 'numeric' 
            })}
          </p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">${payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: "#666" }} 
            stroke="none"
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#666" }} 
            stroke="none" 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Custombarchart;