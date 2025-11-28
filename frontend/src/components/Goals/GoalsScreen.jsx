import React, { useEffect, useState } from 'react';
import GoalCard from './GoalCard';
import DebtCard from './DebtCard';
import AddGoalModal from './AddGoalModal';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { Plus, Loader2 } from 'lucide-react';

const GoalsScreen = () => {
  const { user } = useStore();
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]); // Mock debts for now
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/goals?user_id=${user?.id || 'demo'}`);
        setGoals(res.data);
        
        // Mock debts
        setDebts([
          { id: 'd1', name: 'HDFC Credit Card', current_balance: 15000, interest_rate: 42, emi_amount: 2000, emi_day: 5 }
        ]);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddGoal = async (goalData) => {
    // Optimistic update
    const newGoal = { ...goalData, id: Date.now(), current: 0 };
    setGoals([...goals, newGoal]);
    
    try {
      await api.post(`/goals?user_id=${user?.id}`, goalData);
    } catch (error) {
      console.error("Failed to create goal", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 md:pb-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Goals & Debts</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Debts Column */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Debts to Clear
          </h2>
          <div className="space-y-4">
            {debts.map(debt => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
            {debts.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-100 text-gray-400">
                No active debts. Great job!
              </div>
            )}
          </div>
        </div>

        {/* Goals Column */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Savings Goals
          </h2>
          <div className="space-y-4">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {goals.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                <p>No goals yet. Create one to start saving!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddGoal} 
      />
    </div>
  );
};

export default GoalsScreen;
