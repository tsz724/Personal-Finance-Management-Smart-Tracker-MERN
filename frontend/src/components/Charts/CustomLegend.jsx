import React from 'react';
import { addThousandSeparators } from '../../utils/helper';

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm sm:text-lg">
            {entry.value} <span style={{ color: entry.color }} className="font-bold"></span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;