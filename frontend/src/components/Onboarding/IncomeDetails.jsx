import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, IndianRupee, Calendar } from 'lucide-react';
import useStore from '../../store/useStore';

const IncomeDetails = () => {
  const navigate = useNavigate();
  const { updateOnboardingData, onboardingData } = useStore();
  
  const [minIncome, setMinIncome] = React.useState(onboardingData.monthly_income_min || '');
  const [maxIncome, setMaxIncome] = React.useState(onboardingData.monthly_income_max || '');
  const [pattern, setPattern] = React.useState(onboardingData.income_pattern || 'monthly');

  const handleNext = () => {
    updateOnboardingData({
      monthly_income_min: parseFloat(minIncome),
      monthly_income_max: parseFloat(maxIncome),
      income_pattern: pattern
    });
    navigate('/onboarding/fixed-expenses');
  };

  const isValid = minIncome && maxIncome && parseFloat(maxIncome) >= parseFloat(minIncome);

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Income Details</h2>
        <p className="text-gray-500 mb-8">Roughly how much do you make?</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(p)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium capitalize border ${
                    pattern === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Range (₹)</label>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Min"
                  value={minIncome}
                  onChange={(e) => setMinIncome(e.target.value)}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxIncome}
                  onChange={(e) => setMaxIncome(e.target.value)}
                  className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              It's okay if it varies. Just give an estimate.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!isValid}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <span>Next</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default IncomeDetails;
