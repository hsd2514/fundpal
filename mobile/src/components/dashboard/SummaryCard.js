import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import tw from '../../lib/tailwind';

const SummaryCard = ({ balance, income, expense }) => {
  return (
    <View style={tw`bg-accent-blue rounded-2xl p-6 mb-6`}>
      <Text style={tw`text-blue-200 text-sm font-medium mb-1`}>Total Balance</Text>
      <Text style={tw`text-white text-3xl font-bold mb-6`}>
        ₹{balance.toLocaleString()}
      </Text>

      <View style={tw`flex-row justify-between`}>
        <View>
          <View style={tw`flex-row items-center mb-1`}>
            <View style={tw`w-5 h-5 bg-white/20 rounded-full items-center justify-center mr-1`}>
              <TrendingUp size={12} color="#86efac" />
            </View>
            <Text style={tw`text-blue-200 text-xs`}>Income</Text>
          </View>
          <Text style={tw`font-semibold text-white text-lg`}>₹{income.toLocaleString()}</Text>
        </View>

        <View style={tw`items-end`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Text style={tw`text-blue-200 text-xs mr-1`}>Expense</Text>
            <View style={tw`w-5 h-5 bg-white/20 rounded-full items-center justify-center`}>
              <TrendingDown size={12} color="#fca5a5" />
            </View>
          </View>
          <Text style={tw`font-semibold text-white text-lg`}>₹{expense.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

export default SummaryCard;

