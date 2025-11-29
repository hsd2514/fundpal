import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Shield, TrendingUp, Home, Car } from 'lucide-react-native';
import useStore from '../../store/useStore';
import tw from '../../lib/tailwind';

const GOALS = [
  { id: 'emergency', label: 'Emergency Fund', icon: Shield },
  { id: 'wealth', label: 'Build Wealth', icon: TrendingUp },
  { id: 'home', label: 'Buy Home', icon: Home },
  { id: 'vehicle', label: 'Buy Vehicle', icon: Car },
];

const GoalsScreen = ({ navigation }) => {
  const { updateOnboardingData } = useStore();
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleNext = () => {
    if (selectedGoal) {
      updateOnboardingData({ primary_goal: selectedGoal });
      navigation.navigate('OnboardingSummary');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8`}>
        <View style={tw`mb-12`}>
          <Text style={tw`text-primary text-3xl font-bold mb-2`}>primary goal</Text>
          <Text style={tw`text-secondary text-lg`}>what matters most right now?</Text>
        </View>

        <View style={tw`gap-4 mb-12`}>
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            return (
              <TouchableOpacity 
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                style={tw`flex-row items-center p-5 rounded-xl border ${isSelected ? 'bg-surface border-accent-blue' : 'border-gray-800'}`}
              >
                <View style={tw`p-3 rounded-full mr-4 ${isSelected ? 'bg-accent-blue' : 'bg-gray-800'}`}>
                  <Icon color={isSelected ? 'white' : '#a9a9a9'} size={24} />
                </View>
                <Text style={tw`text-lg ${isSelected ? 'text-white font-bold' : 'text-secondary'}`}>
                  {goal.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={tw`p-5 rounded-xl flex-row justify-between items-center ${selectedGoal ? 'bg-white' : 'bg-gray-800 opacity-50'}`}
          onPress={handleNext}
          disabled={!selectedGoal}
        >
          <Text style={tw`font-bold text-lg ${selectedGoal ? 'text-black' : 'text-gray-500'}`}>
            Next Step
          </Text>
          <ArrowRight color={selectedGoal ? 'black' : 'gray'} size={24} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalsScreen;
