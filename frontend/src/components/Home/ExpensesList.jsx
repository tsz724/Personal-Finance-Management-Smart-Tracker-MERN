import React from 'react';
import { LuArrowRight} from 'react-icons/lu';
import moment from 'moment';
import TransactionInfoCard from '../Card/TransactionInfoCard';

const ExpensesList = ({ expenses, onSeeMore}) => {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h5 className="text-lg font-semibold">Expenses</h5>
        <button className="card-btn text-sm" onClick={onSeeMore}>
          See All <LuArrowRight className="text-sm" />
        </button>
      </div>

      <div className="mt-6">
        {expenses?.slice(0, 5)?.map((expense) => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.category}
            icon={expense.icon}
            date={moment(expense.date).format("Do MMM YYYY")}
            amount={expense.amount}
            type="expense"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default ExpensesList;
