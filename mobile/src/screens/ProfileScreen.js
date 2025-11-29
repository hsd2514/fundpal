import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, LogOut } from 'lucide-react-native';
import api from '../api/client';
import useStore from '../store/useStore';
import tw from '../lib/tailwind';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/profile?user_id=${user?.id || 'demo'}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will be handled by App.js
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-background`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-background`} edges={['top']}>
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6 pb-24`}
        showsVerticalScrollIndicator={false}
      >
        <Text style={tw`text-primary text-2xl font-bold mb-6`}>Profile</Text>

        {/* User Card */}
        <View style={tw`bg-surface p-6 rounded-2xl border border-gray-800 mb-6 flex-row items-center`}>
          <View style={tw`w-16 h-16 bg-accent-blue/20 rounded-full items-center justify-center mr-4`}>
            <User size={32} color="#3b82f6" />
          </View>
          <View>
            <Text style={tw`text-primary text-xl font-bold`}>{user?.name || 'User'}</Text>
            <Text style={tw`text-secondary capitalize`}>
              {profile?.income_type || 'User'} Worker
            </Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={tw`bg-surface rounded-xl border border-gray-800 overflow-hidden mb-4`}>
          <View style={tw`p-4 border-b border-gray-800 flex-row justify-between items-center`}>
            <Text style={tw`text-secondary`}>Financial Literacy</Text>
            <Text style={tw`font-bold text-accent-blue`}>
              Level {profile?.literacy_level || 2}
            </Text>
          </View>
          <View style={tw`p-4 border-b border-gray-800 flex-row justify-between items-center`}>
            <Text style={tw`text-secondary`}>Risk Tolerance</Text>
            <Text style={tw`font-bold text-orange-400 capitalize`}>
              {profile?.risk_tolerance || 'moderate'}
            </Text>
          </View>
          <View style={tw`p-4 flex-row justify-between items-center`}>
            <Text style={tw`text-secondary`}>Primary Goal</Text>
            <Text style={tw`font-bold text-accent-green capitalize`}>
              {profile?.primary_goal?.replace('_', ' ') || 'wealth'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity 
          style={tw`w-full bg-surface p-4 rounded-xl border border-gray-800 flex-row items-center mb-4`}
        >
          <Settings size={20} color="#a9a9a9" />
          <Text style={tw`text-primary ml-3`}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout}
          style={tw`w-full bg-surface p-4 rounded-xl border border-gray-800 flex-row items-center`}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={tw`text-red-400 ml-3`}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

