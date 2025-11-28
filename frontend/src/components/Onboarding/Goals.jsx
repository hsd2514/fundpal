import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Shield, TrendingUp } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

const Goals = () => {
  const navigate = useNavigate();
  const { updateOnboardingData, onboardingData } = useStore();
  const selectedGoal = onboardingData.primary_goal;

  const goals = [
    { id: 'emergency', label: 'Build Emergency Fund', icon: Shield, desc: 'Save for rainy days' },
    { id: 'debt', label: 'Pay Off Debt', icon: TrendingUp, desc: 'Clear loans & credit cards' },
    { id: 'purchase', label: 'Big Purchase', icon: Target, desc: 'Bike, Laptop, Home' },
  ];

  const handleSelect = (id) => {
    updateOnboardingData({ primary_goal: id });
  };

  const handleNext = () => {
    if (selectedGoal) {
      navigate('/onboarding/risk-literacy');
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Primary Goal</h2>
        <p className="text-gray-500 mb-8">What's your main focus right now?</p>

        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => handleSelect(goal.id)}
                className={clsx(
                  'w-full p-4 rounded-xl border-2 flex items-center text-left transition-all',
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                )}
              >
                <div className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center mr-4',
                  isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className={clsx('font-bold', isSelected ? 'text-blue-900' : 'text-gray-900')}>
                    {goal.label}
                  </h3>
                  <p className="text-sm text-gray-500">{goal.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedGoal}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <span>Next</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Goals;
