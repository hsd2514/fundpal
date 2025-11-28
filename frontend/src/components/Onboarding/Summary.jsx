import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import useStore from '../../store/useStore';
import api from '../../api/client';

const Summary = () => {
  const navigate = useNavigate();
  const { onboardingData, completeOnboarding, setUser } = useStore();
  const [loading, setLoading] = React.useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create a random user ID for now (or get from auth if we had it)
      const userId = `user_${Math.floor(Math.random() * 10000)}`;
      
      await api.post(`/onboarding?user_id=${userId}`, {
        ...onboardingData,
        // Add defaults if missing
        age_group: '26-35', // Default
        supports_family: false // Default
      });

      setUser({ id: userId, name: 'User' });
      completeOnboarding();
      navigate('/');
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          We've customized FundPal for your {onboardingData.income_type} income style.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl w-full max-w-xs text-left space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Income Type</span>
            <span className="font-medium capitalize">{onboardingData.income_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Goal</span>
            <span className="font-medium capitalize">{onboardingData.primary_goal?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Risk Profile</span>
            <span className="font-medium capitalize">{onboardingData.risk_tolerance}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleFinish}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:opacity-70 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <span>Start Using FundPal</span>
        )}
      </button>
    </div>
  );
};

export default Summary;
