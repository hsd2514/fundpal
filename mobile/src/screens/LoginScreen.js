import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';
import tw from '../lib/tailwind';
import useStore from '../store/useStore';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      setUser(response.data);
      console.log('Login successful, updating user state...');
      // Navigation is handled automatically by App.js when user state changes
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.detail || 'Login failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-background`}>
      <View style={tw`flex-1 justify-center px-8`}>
        <View style={tw`mb-12`}>
          <Text style={tw`text-primary text-4xl font-bold mb-2`}>fundpal</Text>
          <Text style={tw`text-secondary text-lg`}>manage your wealth.</Text>
        </View>

        <View style={tw`gap-6`}>
          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>PHONE NUMBER</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800`}
              placeholder="9876543210"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>

          <View>
            <Text style={tw`text-secondary mb-2 ml-1`}>PASSWORD</Text>
            <TextInput 
              style={tw`bg-surface text-primary p-4 rounded-xl border border-gray-800`}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
          </View>

          <TouchableOpacity 
            style={tw`bg-white p-4 rounded-xl items-center mt-4`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={tw`text-black font-bold text-lg`}>Proceed</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={tw`mt-8 items-center`}>
          <Text style={tw`text-secondary`}>don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={tw`text-accent-blue font-bold mt-1`}>apply for access</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
