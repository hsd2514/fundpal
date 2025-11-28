import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { User, Settings, LogOut, Loader2 } from 'lucide-react';

const ProfileScreen = () => {
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
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
          <p className="text-gray-500 capitalize">{profile?.income_type} Worker</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-gray-600">Financial Literacy</span>
            <span className="font-bold text-blue-600">Level {profile?.literacy_level}</span>
          </div>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <span className="text-gray-600">Risk Tolerance</span>
            <span className="font-bold text-orange-600 capitalize">{profile?.risk_tolerance}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-gray-600">Primary Goal</span>
            <span className="font-bold text-green-600 capitalize">{profile?.primary_goal?.replace('_', ' ')}</span>
          </div>
        </div>

        <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center text-gray-700 hover:bg-gray-50">
          <Settings size={20} className="mr-3 text-gray-400" />
          <span>Settings</span>
        </button>

        <button 
          onClick={logout}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-3" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
