import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useStore from './src/store/useStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import WelcomeScreen from './src/screens/Onboarding/WelcomeScreen';
import IncomeScreen from './src/screens/Onboarding/IncomeScreen';
import ExpensesScreen from './src/screens/Onboarding/ExpensesScreen';
import GoalsScreen from './src/screens/Onboarding/GoalsScreen';
import SummaryScreen from './src/screens/Onboarding/SummaryScreen';

// Tab Navigator
import TabNavigator from './src/navigation/TabNavigator';

import PaymentWebViewScreen from './src/screens/PaymentWebViewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, isOnboarded } = useStore();

  useEffect(() => {
    console.log("App State Update - User:", user ? "Logged In" : "Logged Out", "Onboarded:", isOnboarded);
  }, [user, isOnboarded]);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f0f' },
          animation: 'slide_from_right'
        }}
      >
        {!user ? (
          // Auth Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !isOnboarded ? (
          // Onboarding Flow
          <>
            <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
            <Stack.Screen name="OnboardingIncome" component={IncomeScreen} />
            <Stack.Screen name="OnboardingExpenses" component={ExpensesScreen} />
            <Stack.Screen name="OnboardingGoals" component={GoalsScreen} />
            <Stack.Screen name="OnboardingSummary" component={SummaryScreen} />
          </>
        ) : (
          // Main App Flow
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
