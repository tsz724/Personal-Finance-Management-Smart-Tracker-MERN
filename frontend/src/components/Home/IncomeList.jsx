import React from 'react';
import { LuArrowRight} from 'react-icons/lu';
import moment from 'moment';
import TransactionInfoCard from '../Card/TransactionInfoCard';

const IncomeList = ({ income, onSeeMore}) => {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-lg font-semibold">Income</h5>
        <button className="card-btn text-sm" onClick={onSeeMore}>
          See All <LuArrowRight className="text-sm" />
        </button>
      </div>

      <div className="mt-6">
        {income?.slice(0, 5)?.map((income) => (
          <TransactionInfoCard
            key={income._id}
            title={income.source}
            icon={income.icon}
            date={moment(income.date).format("Do MMM YYYY")}
            amount={income.amount}
            type="income"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
