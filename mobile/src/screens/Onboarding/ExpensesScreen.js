import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import useStore from '../../store/useStore';
import tw from '../../lib/tailwind';

const ExpensesScreen = ({ navigation }) => {
  const { updateOnboardingData } = useStore();
  const [rent, setRent] = useState('');
  const [emi, setEmi] = useState('');
  const [other, setOther] = useState('');

  const handleNext = () => {
    updateOnboardingData({
      monthly_rent: parseFloat(rent) || 0,
      monthly_emi_total: parseFloat(emi) || 0,
      monthly_fixed_other: parseFloat(other) || 0,
    });
    navigation.navigate('OnboardingGoals');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8`}>
        <View style={tw`mb-12`}>
          <Text style={tw`text-primary text-3xl font-bold mb-2`}>fixed expenses</Text>
          <Text style={tw`text-secondary text-lg`}>what goes out every month?</Text>
        </View>

        <View style={tw`gap-6 mb-12`}>
          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>RENT / HOUSING (₹)</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800 text-xl`}
              placeholder="15000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={rent}
              onChangeText={setRent}
            />
          </View>

          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>TOTAL EMIs (₹)</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800 text-xl`}
              placeholder="5000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={emi}
              onChangeText={setEmi}
            />
          </View>

          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>OTHER FIXED COSTS (₹)</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800 text-xl`}
              placeholder="2000"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={other}
              onChangeText={setOther}
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

export default ExpensesScreen;
