import React from 'react';

const QuickActions = ({ onAction }) => {
  const actions = [
    "Log Expense",
    "Log Income",
    "Budget Status",
    "Advice"
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 no-scrollbar">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="whitespace-nowrap px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
