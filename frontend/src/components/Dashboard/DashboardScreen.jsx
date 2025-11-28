import React, { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard';
import RunwayIndicator from './RunwayIndicator';
import CategoryChart from './CategoryChart';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { Loader2 } from 'lucide-react';

const DashboardScreen = () => {
  const { user } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/dashboard?user_id=${user?.id || 'demo'}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
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

  if (!data) return <div className="p-6">Failed to load data</div>;

  // Calculate totals for summary card (mock logic if not in API)
  // Assuming API returns { current_balance, ... }
  // We might need income/expense totals from API. 
  // For now, let's mock income/expense if missing or derive.
  
  return (
    <div className="p-6 pb-24 md:pb-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="avatar" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard 
              balance={data.current_balance || 0} 
              income={data.total_income || 0} 
              expense={data.total_expense || 0} 
            />
            <RunwayIndicator 
              days={Math.floor((data.current_balance || 0) / (data.daily_essential || 1))} 
            />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
             <p className="text-gray-400 text-sm">Chart placeholder (Spending over time)</p>
             <div className="h-40 bg-gray-50 rounded-xl mt-2 flex items-center justify-center text-gray-300">
               Chart Area
             </div>
          </div>
        </div>

        {/* Right Column - Categories & Quick Stats */}
        <div className="space-y-6">
          <CategoryChart categories={data.categories || {}} />
          
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Quick Tip</h3>
            <p className="text-sm text-blue-700">
              You're spending 20% less on food this week. Keep it up!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
