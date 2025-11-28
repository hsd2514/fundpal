import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home, CreditCard, Zap } from 'lucide-react';
import useStore from '../../store/useStore';

const FixedExpenses = () => {
  const navigate = useNavigate();
  const { updateOnboardingData, onboardingData } = useStore();
  
  const [rent, setRent] = React.useState(onboardingData.monthly_rent || '');
  const [emi, setEmi] = React.useState(onboardingData.monthly_emi_total || '');
  const [other, setOther] = React.useState(onboardingData.monthly_fixed_other || '');

  const handleNext = () => {
    updateOnboardingData({
      monthly_rent: parseFloat(rent) || 0,
      monthly_emi_total: parseFloat(emi) || 0,
      monthly_fixed_other: parseFloat(other) || 0
    });
    navigate('/onboarding/goals');
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fixed Expenses</h2>
        <p className="text-gray-500 mb-8">What do you MUST pay every month?</p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Home size={20} className="text-blue-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">Rent / Housing</label>
            </div>
            <input
              type="number"
              placeholder="0"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="block w-full p-2 border-b border-gray-200 focus:border-blue-500 focus:ring-0 text-lg"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-2">
              <CreditCard size={20} className="text-purple-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">Total EMIs</label>
            </div>
            <input
              type="number"
              placeholder="0"
              value={emi}
              onChange={(e) => setEmi(e.target.value)}
              className="block w-full p-2 border-b border-gray-200 focus:border-blue-500 focus:ring-0 text-lg"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Zap size={20} className="text-yellow-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">Other Fixed (Bills)</label>
            </div>
            <input
              type="number"
              placeholder="0"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              className="block w-full p-2 border-b border-gray-200 focus:border-blue-500 focus:ring-0 text-lg"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2"
      >
        <span>Next</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default FixedExpenses;
