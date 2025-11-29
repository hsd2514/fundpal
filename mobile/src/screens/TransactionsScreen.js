import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import api from '../api/client';
import useStore from '../store/useStore';
import tw from '../lib/tailwind';

const TransactionsScreen = () => {
  const { user } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/transactions?user_id=${user?.id || 'demo'}`);
        setTransactions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
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
          <Text style={tw`text-primary text-2xl font-bold`}>Transactions</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={tw`bg-surface p-8 rounded-xl border border-gray-800 items-center`}>
            <Text style={tw`text-secondary text-center`}>No transactions found.</Text>
          </View>
        ) : (
          <View style={tw`bg-surface rounded-xl border border-gray-800 overflow-hidden`}>
            {transactions.map((txn) => {
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

export default TransactionsScreen;

