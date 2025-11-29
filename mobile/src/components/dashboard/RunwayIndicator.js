import React from 'react';
import { View, Text } from 'react-native';
import tw from '../../lib/tailwind';

const RunwayIndicator = ({ days }) => {
  let color = 'bg-accent-green';
  let textColor = 'text-accent-green';
  let text = 'Safe Zone';
  
  if (days < 7) {
    color = 'bg-orange-500';
    textColor = 'text-orange-400';
    text = 'Warning Zone';
  }
  if (days < 3) {
    color = 'bg-red-500';
    textColor = 'text-red-400';
    text = 'Critical Zone';
  }

  // Cap at 30 days for visual
  const percentage = Math.min((days / 30) * 100, 100);

  return (
    <View style={tw`bg-surface p-5 rounded-2xl border border-gray-800 mb-6`}>
      <View style={tw`flex-row justify-between items-end mb-3`}>
        <View>
          <Text style={tw`text-secondary text-xs font-medium uppercase tracking-wider`}>
            Financial Runway
          </Text>
          <Text style={tw`text-primary text-2xl font-bold`}>
            {days} <Text style={tw`text-sm font-normal text-secondary`}>Days</Text>
          </Text>
        </View>
        <View style={tw`${color}/20 px-2 py-1 rounded-full`}>
          <Text style={tw`${textColor} text-xs font-bold`}>{text}</Text>
        </View>
      </View>

      <View style={tw`w-full h-3 bg-gray-900 rounded-full overflow-hidden`}>
        <View 
          style={[tw`h-full rounded-full ${color}`, { width: `${percentage}%` }]}
        />
      </View>
      <Text style={tw`text-xs text-secondary mt-2`}>
        You can survive for {days} days without new income.
      </Text>
    </View>
  );
};

export default RunwayIndicator;

