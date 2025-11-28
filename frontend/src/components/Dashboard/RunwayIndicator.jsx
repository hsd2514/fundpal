import React from 'react';
import clsx from 'clsx';

const RunwayIndicator = ({ days }) => {
  let color = 'bg-green-500';
  let text = 'Safe Zone';
  
  if (days < 7) {
    color = 'bg-orange-500';
    text = 'Warning Zone';
  }
  if (days < 3) {
    color = 'bg-red-500';
    text = 'Critical Zone';
  }

  // Cap at 30 days for visual
  const percentage = Math.min((days / 30) * 100, 100);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Financial Runway</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {days} <span className="text-sm font-normal text-gray-500">Days</span>
          </h3>
        </div>
        <span className={clsx('text-xs font-bold px-2 py-1 rounded-full bg-opacity-10', color.replace('bg-', 'text-'), color.replace('bg-', 'bg-'))}>
          {text}
        </span>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={clsx('h-full rounded-full transition-all duration-1000', color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        You can survive for {days} days without new income.
      </p>
    </div>
  );
};

export default RunwayIndicator;
