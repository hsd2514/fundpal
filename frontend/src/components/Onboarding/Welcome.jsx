import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm">
        <Wallet size={40} className="text-white" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-center">FundPal</h1>
      <p className="text-lg text-blue-100 text-center mb-12 max-w-xs">
        Your personal financial companion for irregular income.
      </p>

      <button
        onClick={() => navigate('/onboarding/income-type')}
        className="w-full max-w-xs bg-white text-blue-600 font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 hover:bg-blue-50 transition-colors"
      >
        <span>Let's Start</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Welcome;
