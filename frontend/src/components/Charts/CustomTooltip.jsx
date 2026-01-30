import React from 'react'
import { addThousandSeparators } from '../../utils/helper';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm font-medium text-gray-600">Amount: 
            <span className="text-sm font-bold text-gray-900">₹{addThousandSeparators(payload[0].value)}</span>
          </p>
          
        </div>
      );
    }
    return null;
  };

export default CustomTooltip