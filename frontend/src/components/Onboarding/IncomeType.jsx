import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Truck, Store, Layers, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import clsx from 'clsx';

const IncomeType = () => {
  const navigate = useNavigate();
  const { updateOnboardingData, onboardingData } = useStore();
  const selectedType = onboardingData.income_type;

  const types = [
    { id: 'salaried', label: 'Salaried', icon: Briefcase, desc: 'Fixed monthly income' },
    { id: 'gig', label: 'Gig Worker', icon: Truck, desc: 'Daily/Weekly payouts (Swiggy, Uber)' },
    { id: 'business', label: 'Small Business', icon: Store, desc: 'Shop owner, trader' },
    { id: 'mixed', label: 'Mixed Income', icon: Layers, desc: 'Salary + Side gigs' },
  ];

  const handleSelect = (id) => {
    updateOnboardingData({ income_type: id });
  };

  const handleNext = () => {
    if (selectedType) {
      navigate('/onboarding/income-details');
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you earn?</h2>
        <p className="text-gray-500 mb-8">Select the option that best describes you.</p>

        <div className="space-y-4">
          {types.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
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
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-500">{type.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedType}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <span>Next</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default IncomeType;
