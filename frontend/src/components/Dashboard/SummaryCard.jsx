import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

const SummaryCard = ({ balance, income, expense }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-6">
      <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <IndianRupee size={28} />
        {balance.toLocaleString()}
      </h2>

      <div className="flex justify-between">
        <div>
          <div className="flex items-center text-blue-100 text-xs mb-1">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-1">
              <TrendingUp size={12} className="text-green-300" />
            </div>
            Income
          </div>
          <p className="font-semibold text-lg">₹{income.toLocaleString()}</p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end text-blue-100 text-xs mb-1">
            Expense
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center ml-1">
              <TrendingDown size={12} className="text-red-300" />
            </div>
          </div>
          <p className="font-semibold text-lg">₹{expense.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
