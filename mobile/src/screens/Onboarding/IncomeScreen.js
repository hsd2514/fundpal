import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import useStore from '../../store/useStore';
import tw from '../../lib/tailwind';

const IncomeScreen = ({ navigation }) => {
  const { updateOnboardingData } = useStore();
  const [income, setIncome] = useState('');
  const [type, setType] = useState('salaried');

  const handleNext = () => {
    const incomeValue = parseFloat(income) || 0;
    // Map income type to backend format
    const incomeTypeMap = {
      'salaried': 'salaried',
      'freelance': 'gig',
      'business': 'business'
    };
    
    updateOnboardingData({
      income_type: incomeTypeMap[type] || 'salaried',
      income_pattern: type === 'salaried' ? 'monthly' : (type === 'freelance' ? 'irregular' : 'monthly'),
      monthly_income_min: incomeValue,
      monthly_income_max: incomeValue,
    });
    navigation.navigate('OnboardingExpenses');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8`}>
        <View style={tw`mb-12`}>
          <Text style={tw`text-primary text-3xl font-bold mb-2`}>income details</Text>
          <Text style={tw`text-secondary text-lg`}>how do you earn?</Text>
        </View>

        <View style={tw`gap-6 mb-12`}>
          <View>
            <Text style={tw`text-secondary mb-4 ml-1`}>SOURCE OF INCOME</Text>
            <View style={tw`flex-row gap-4`}>
              {['salaried', 'freelance', 'business'].map((t) => (
                <TouchableOpacity 
                  key={t}
                  onPress={() => setType(t)}
                  style={tw`flex-1 p-4 rounded-xl border ${type === t ? 'bg-surface border-accent-blue' : 'border-gray-800'}`}
                >
                  <Text style={tw`text-center capitalize ${type === t ? 'text-accent-blue font-bold' : 'text-secondary'}`}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>MONTHLY INCOME (₹)</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800 text-xl`}
              placeholder="50000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={tw`bg-white p-5 rounded-xl flex-row justify-between items-center`}
          onPress={handleNext}
        >
          <Text style={tw`text-black font-bold text-lg`}>Next Step</Text>
          <ArrowRight color="black" size={24} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomeScreen;
