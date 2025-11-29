import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import api from '../api/client';
import useStore from '../store/useStore';
import tw from '../lib/tailwind';

const GoalsScreen = () => {
  const { user } = useStore();
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/goals?user_id=${user?.id || 'demo'}`);
        setGoals(res.data || []);
        
        // Mock debts for now
        setDebts([
          { id: 'd1', name: 'HDFC Credit Card', current_balance: 15000, interest_rate: 42, emi_amount: 2000, emi_day: 5 }
        ]);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-background`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-background`} edges={['top']}>
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pb-24`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <Text style={tw`text-primary text-2xl font-bold`}>Goals & Debts</Text>
          <TouchableOpacity 
            style={tw`bg-accent-blue px-4 py-2 rounded-lg flex-row items-center`}
          >
            <Plus size={18} color="white" />
            <Text style={tw`text-white text-sm font-medium ml-2`}>New Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Debts Section */}
        <View style={tw`mb-8`}>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-2 bg-red-500 rounded-full mr-2`} />
            <Text style={tw`text-secondary text-xs font-bold uppercase tracking-wider`}>
              Debts to Clear
            </Text>
          </View>
          
          {debts.map(debt => (
            <View key={debt.id} style={tw`bg-surface p-4 rounded-xl border border-gray-800 mb-3`}>
              <Text style={tw`text-primary font-bold text-lg mb-1`}>{debt.name}</Text>
              <Text style={tw`text-secondary text-sm mb-2`}>
                Balance: ₹{debt.current_balance.toLocaleString()}
              </Text>
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-secondary text-xs`}>Interest: {debt.interest_rate}%</Text>
                <Text style={tw`text-secondary text-xs`}>EMI: ₹{debt.emi_amount}/mo</Text>
              </View>
            </View>
          ))}
          
          {debts.length === 0 && (
            <View style={tw`bg-surface p-8 rounded-xl border border-gray-800 items-center`}>
              <Text style={tw`text-secondary text-center`}>No active debts. Great job!</Text>
            </View>
          )}
        </View>

        {/* Goals Section */}
        <View>
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`w-2 h-2 bg-accent-green rounded-full mr-2`} />
            <Text style={tw`text-secondary text-xs font-bold uppercase tracking-wider`}>
              Savings Goals
            </Text>
          </View>
          
          {goals.map(goal => {
            const progress = goal.current_amount / goal.target_amount;
            return (
              <View key={goal.id} style={tw`bg-surface p-4 rounded-xl border border-gray-800 mb-3`}>
                <Text style={tw`text-primary font-bold text-lg mb-1`}>{goal.name}</Text>
                <View style={tw`flex-row justify-between mb-2`}>
                  <Text style={tw`text-secondary text-sm`}>
                    ₹{goal.current_amount?.toLocaleString() || 0} / ₹{goal.target_amount?.toLocaleString()}
                  </Text>
                  <Text style={tw`text-accent-green text-sm font-bold`}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <View style={tw`w-full h-2 bg-gray-900 rounded-full overflow-hidden`}>
                  <View 
                    style={[
                      tw`h-full bg-accent-green rounded-full`,
                      { width: `${Math.min(progress * 100, 100)}%` }
                    ]}
                  />
                </View>
              </View>
            );
          })}
          
          {goals.length === 0 && (
            <View style={tw`bg-surface p-8 rounded-xl border border-dashed border-gray-800 items-center`}>
              <Text style={tw`text-secondary text-center`}>
                No goals yet. Create one to start saving!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalsScreen;

