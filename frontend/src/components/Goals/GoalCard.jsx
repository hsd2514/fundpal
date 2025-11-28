import React from 'react';
import { Target, Calendar } from 'lucide-react';

const GoalCard = ({ goal }) => {
  const targetAmount = goal.target || goal.target_amount || 0;
  const currentAmount = goal.current || 0;
  const percent = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{goal.name}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={12} className="mr-1" />
              {goal.deadline}
            </div>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-600">{Math.round(percent)}%</span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>₹{currentAmount.toLocaleString()}</span>
          <span>₹{targetAmount.toLocaleString()}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
