import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ArrowRight } from 'lucide-react-native';
import useStore from '../../store/useStore';
import api from '../../api/client';
import tw from '../../lib/tailwind';

const SummaryScreen = ({ navigation }) => {
  const { user, onboardingData, completeOnboarding } = useStore();
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Ensure all required fields are present
      const payload = {
        user_id: user.id,
        income_type: onboardingData.income_type || 'salaried',
        income_pattern: onboardingData.income_pattern || 'monthly',
        monthly_income_min: onboardingData.monthly_income_min || 0,
        monthly_income_max: onboardingData.monthly_income_max || onboardingData.monthly_income_min || 0,
        monthly_rent: onboardingData.monthly_rent || 0,
        monthly_emi_total: onboardingData.monthly_emi_total || 0,
        monthly_fixed_other: onboardingData.monthly_fixed_other || 0,
        supports_family: onboardingData.supports_family || false,
        age_group: onboardingData.age_group || '26-35',
        primary_goal: onboardingData.primary_goal || 'wealth',
        risk_tolerance: onboardingData.risk_tolerance || 'moderate',
        literacy_level: onboardingData.literacy_level || 2,
      };
      
      // Send data to backend
      await api.post('/onboarding', payload);
      
      completeOnboarding();
      // Navigation will be handled by App.js based on isOnboarded state
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save profile. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Onboarding error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <View style={tw`flex-1 justify-center px-8`}>
        <View style={tw`mb-12 items-center`}>
          <View style={tw`w-20 h-20 bg-accent-green rounded-full items-center justify-center mb-6`}>
            <Check color="black" size={40} />
          </View>
          <Text style={tw`text-primary text-3xl font-bold mb-2 text-center`}>all set!</Text>
          <Text style={tw`text-secondary text-lg text-center`}>
            your profile is ready. let's start managing your wealth.
          </Text>
        </View>

        <View style={tw`bg-surface p-6 rounded-xl mb-12 border border-gray-800`}>
          <Text style={tw`text-secondary mb-2`}>PRIMARY GOAL</Text>
          <Text style={tw`text-primary text-xl font-bold capitalize mb-6`}>{onboardingData.primary_goal?.replace('_', ' ')}</Text>
          
          <Text style={tw`text-secondary mb-2`}>MONTHLY INCOME</Text>
          <Text style={tw`text-primary text-xl font-bold`}>₹{onboardingData.monthly_income_min || onboardingData.monthly_income_max || '0'}</Text>
        </View>

        <TouchableOpacity 
          style={tw`bg-white p-5 rounded-xl flex-row justify-between items-center`}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Text style={tw`text-black font-bold text-lg`}>Enter FundPal</Text>
              <ArrowRight color="black" size={24} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SummaryScreen;
