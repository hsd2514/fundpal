import React from 'react';
import { TrendingDown, AlertCircle } from 'lucide-react';

const DebtCard = ({ debt }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm mb-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">
              <TrendingDown size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{debt.name}</h3>
              <p className="text-xs text-red-500 font-medium">{debt.interest_rate}% Interest</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="font-bold text-gray-900">₹{debt.current_balance.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-red-50 p-2 rounded-lg text-red-700">
          <div className="flex items-center">
            <AlertCircle size={12} className="mr-1" />
            EMI: ₹{debt.emi_amount}/mo
          </div>
          <span>Due: {debt.emi_day}th</span>
        </div>
      </div>
    </div>
  );
};

export default DebtCard;
