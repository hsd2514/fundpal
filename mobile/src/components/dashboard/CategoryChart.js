import React from 'react';
import { View, Text } from 'react-native';
import tw from '../../lib/tailwind';

const CategoryChart = ({ categories }) => {
  // categories is { "Food": { spent: 500, budget: 2000 }, ... }
  const data = Object.entries(categories || {}).map(([name, val]) => ({
    name,
    spent: val.spent || 0,
    budget: val.budget || 0,
    percent: val.budget > 0 ? Math.min((val.spent / val.budget) * 100, 100) : 0
  }));

  return (
    <View style={tw`bg-surface p-5 rounded-2xl border border-gray-800`}>
      <Text style={tw`font-bold text-primary mb-4`}>Budget vs Spent</Text>
      
      <View style={tw`gap-4`}>
        {data.map((item) => (
          <View key={item.name} style={tw`mb-2`}>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`font-medium text-primary text-sm`}>{item.name}</Text>
              <Text style={tw`text-secondary text-sm`}>
                ₹{item.spent} <Text style={tw`text-xs`}>/ ₹{item.budget}</Text>
              </Text>
            </View>
            <View style={tw`w-full h-2 bg-gray-900 rounded-full overflow-hidden`}>
              <View 
                style={[
                  tw`h-full rounded-full ${item.percent > 90 ? 'bg-red-500' : 'bg-accent-blue'}`,
                  { width: `${item.percent}%` }
                ]}
              />
            </View>
          </View>
        ))}
        
        {data.length === 0 && (
          <Text style={tw`text-center text-secondary text-sm py-4`}>No spending data yet.</Text>
        )}
      </View>
    </View>
  );
};

export default CategoryChart;

