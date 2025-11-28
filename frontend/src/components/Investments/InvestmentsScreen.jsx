import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { PieChart, TrendingUp, Shield, AlertTriangle, Loader2 } from 'lucide-react';

const InvestmentsScreen = () => {
  const { user } = useStore();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/investments?user_id=${user?.id || 'demo'}`);
        setInvestments(res.data);
      } catch (error) {
        console.error("Failed to fetch investments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  const totalAllocation = investments.reduce((acc, inv) => acc + inv.allocation_percentage, 0);

  return (
    <div className="p-6 pb-24 md:pb-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
          {investments.length > 0 ? 'Active Plan' : 'No Plan'}
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
            <TrendingUp size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start Your Journey</h2>
          <p className="text-gray-500 mb-6">
            Ask FundPal "How should I invest?" to get a personalized allocation plan based on your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Allocation Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-blue-600" />
              Target Allocation
            </h3>
            
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv.id} className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex justify-between text-sm mb-1">
                    <div>
                      <span className="font-bold text-gray-900 block">{inv.fund_name || inv.asset_class}</span>
                      <span className="text-xs text-gray-500">{inv.type} • {inv.asset_class}</span>
                    </div>
                    <span className="font-bold text-blue-600 text-lg">{inv.allocation_percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${inv.allocation_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-green-900 text-sm">Safe & Stable</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Your debt allocation ensures capital protection during market volatility.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm">Risk Note</h4>
                  <p className="text-xs text-orange-700 mt-1">
                    Equity investments are subject to market risks. Invest for long term (&gt;5 years).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsScreen;
