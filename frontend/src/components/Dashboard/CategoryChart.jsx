import React from 'react';

const CategoryChart = ({ categories }) => {
  // categories is { "Food": { spent: 500, budget: 2000 }, ... }
  const data = Object.entries(categories).map(([name, val]) => ({
    name,
    spent: val.spent,
    budget: val.budget,
    percent: Math.min((val.spent / val.budget) * 100, 100)
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">Budget vs Spent</h3>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{item.name}</span>
              <span className="text-gray-500">
                ₹{item.spent} <span className="text-xs">/ ₹{item.budget}</span>
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No spending data yet.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
