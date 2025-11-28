import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';
import useStore from '../../store/useStore';

const RiskLiteracy = () => {
  const navigate = useNavigate();
  const { updateOnboardingData, onboardingData } = useStore();
  
  const [risk, setRisk] = React.useState(onboardingData.risk_tolerance || 'moderate');
  const [literacy, setLiteracy] = React.useState(onboardingData.literacy_level || 2);

  const handleNext = () => {
    updateOnboardingData({
      risk_tolerance: risk,
      literacy_level: literacy
    });
    navigate('/onboarding/summary');
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h2>
        <p className="text-gray-500 mb-8">Help us personalize your advice.</p>

        <div className="space-y-8">
          {/* Risk Tolerance */}
          <div>
            <div className="flex items-center mb-4">
              <AlertTriangle size={20} className="text-orange-500 mr-2" />
              <label className="text-lg font-bold text-gray-900">Risk Tolerance</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'moderate', 'aggressive'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium capitalize border-2 transition-all ${
                    risk === r
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {risk === 'conservative' && "I prefer safety over high returns."}
              {risk === 'moderate' && "I want a balance of safety and growth."}
              {risk === 'aggressive' && "I'm okay with ups and downs for higher returns."}
            </p>
          </div>

          {/* Financial Literacy */}
          <div>
            <div className="flex items-center mb-4">
              <BookOpen size={20} className="text-blue-500 mr-2" />
              <label className="text-lg font-bold text-gray-900">Financial Knowledge</label>
            </div>
            <div className="space-y-3">
              {[
                { val: 1, label: 'Beginner', desc: 'Explain everything simply' },
                { val: 2, label: 'Intermediate', desc: 'I know the basics (FDs, EMIs)' },
                { val: 3, label: 'Advanced', desc: 'I know about SIPs, Stocks, Tax' },
              ].map((l) => (
                <button
                  key={l.val}
                  onClick={() => setLiteracy(l.val)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    literacy === l.val
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="font-bold text-gray-900">{l.label}</div>
                  <div className="text-xs text-gray-500">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2"
      >
        <span>Review Profile</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default RiskLiteracy;
