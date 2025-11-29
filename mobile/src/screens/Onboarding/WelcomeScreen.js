import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import tw from '../../lib/tailwind';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <View style={tw`flex-1 justify-center px-8`}>
        <View style={tw`mb-12`}>
          <Text style={tw`text-primary text-5xl font-bold mb-4`}>hello.</Text>
          <Text style={tw`text-secondary text-xl leading-8`}>
            let's get to know you better to personalize your financial journey.
          </Text>
        </View>

        <TouchableOpacity 
          style={tw`bg-white p-5 rounded-xl flex-row justify-between items-center`}
          onPress={() => navigation.navigate('OnboardingIncome')}
        >
          <Text style={tw`text-black font-bold text-lg`}>Start Setup</Text>
          <ArrowRight color="black" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
