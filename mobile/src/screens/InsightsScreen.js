import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowDownLeft, ArrowUpRight, Sparkles, PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';
import useStore from '../store/useStore';
import tw from '../lib/tailwind';

const InsightsScreen = () => {
  const { user } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/insights?user_id=${user?.id || 'demo'}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch insights", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchData();
      }
    }, [user])
  );

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-background`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={tw`text-secondary mt-4`}>Analyzing your finances...</Text>
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
          <Text style={tw`text-primary text-2xl font-bold`}>Insights</Text>
          <Sparkles size={24} color="#f59e0b" />
        </View>

        {/* AI Insight Card */}
        <LinearGradient
          colors={['#27272a', '#18181b']}
          style={tw`p-5 rounded-2xl border border-gray-800 mb-6`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <Sparkles size={16} color="#f59e0b" style={tw`mr-2`} />
            <Text style={tw`text-gray-400 text-xs uppercase font-bold tracking-wider`}>AI Analysis</Text>
          </View>
          <Text style={tw`text-white text-base leading-6`}>
            {data?.insight || "Keep spending to generate insights!"}
          </Text>
        </LinearGradient>

        {/* Category Breakdown */}
        <Text style={tw`text-white text-lg font-bold mb-4`}>Spending by Category</Text>
        <View style={tw`bg-surface p-4 rounded-xl border border-gray-800 mb-6`}>
            {data?.category_breakdown && Object.keys(data.category_breakdown).length > 0 ? (
                Object.entries(data.category_breakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([cat, amount], index) => {
                        const pct = (amount / data.total_spend) * 100;
                        return (
                            <View key={cat} style={tw`mb-4 last:mb-0`}>
                                <View style={tw`flex-row justify-between mb-1`}>
                                    <Text style={tw`text-gray-300 text-sm`}>{cat}</Text>
                                    <Text style={tw`text-white font-bold text-sm`}>₹{amount.toLocaleString()}</Text>
                                </View>
                                <View style={tw`h-2 bg-gray-800 rounded-full overflow-hidden`}>
                                    <View style={[tw`h-full rounded-full`, { width: `${pct}%`, backgroundColor: getColorForIndex(index) }]} />
                                </View>
                            </View>
                        );
                    })
            ) : (
                <Text style={tw`text-secondary text-center py-4`}>No spending data yet.</Text>
            )}
        </View>

        {/* Recent Transactions */}
        <Text style={tw`text-white text-lg font-bold mb-4`}>Recent Transactions</Text>
        {data?.recent_transactions?.length === 0 ? (
          <View style={tw`bg-surface p-8 rounded-xl border border-gray-800 items-center`}>
            <Text style={tw`text-secondary text-center`}>No transactions found.</Text>
          </View>
        ) : (
          <View style={tw`bg-surface rounded-xl border border-gray-800 overflow-hidden`}>
            {data?.recent_transactions?.map((txn) => {
              const isExpense = txn.type === 'expense';
              const date = new Date(txn.transaction_date).toLocaleDateString();
              
              return (
                <View 
                  key={txn.id} 
                  style={tw`flex-row items-center p-4 border-b border-gray-800 last:border-0`}
                >
                  <View style={tw`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    isExpense ? 'bg-red-500/20' : 'bg-accent-green/20'
                  }`}>
                    {isExpense ? (
                      <ArrowUpRight size={18} color={isExpense ? '#ef4444' : '#10b981'} />
                    ) : (
                      <ArrowDownLeft size={18} color="#10b981" />
                    )}
                  </View>
                  
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-primary font-medium text-sm`}>
                      {txn.category || 'Uncategorized'}
                    </Text>
                    <Text style={tw`text-secondary text-xs mt-0.5`}>{date}</Text>
                  </View>
                  
                  <Text style={tw`font-bold text-sm ${
                    isExpense ? 'text-red-400' : 'text-accent-green'
                  }`}>
                    {isExpense ? '-' : '+'}₹{txn.amount?.toLocaleString() || 0}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getColorForIndex = (index) => {
    const colors = ['#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#10b981'];
    return colors[index % colors.length];
};

export default InsightsScreen;
