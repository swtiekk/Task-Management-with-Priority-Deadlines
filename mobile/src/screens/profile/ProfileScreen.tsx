import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Mail, Shield, ChevronRight, Bell, Settings } from 'lucide-react-native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="bg-white p-8 rounded-b-[40px] items-center shadow-sm mb-6">
        <View className="bg-primary/10 p-6 rounded-full mb-4">
          <User color="#0097A7" size={48} />
        </View>
        <Text className="text-2xl font-bold text-text">
          {user?.first_name} {user?.last_name}
        </Text>
        <Text className="text-muted text-base">{user?.email}</Text>
      </View>

      <View className="px-6 space-y-4">
        <Text className="text-xs font-bold text-muted uppercase tracking-widest ml-1 mb-2">Account Settings</Text>
        
        <ProfileItem 
          icon={<Mail size={20} color="#9CA3AF" />} 
          title="Email" 
          value={user?.email || ''} 
        />
        <ProfileItem 
          icon={<Shield size={20} color="#9CA3AF" />} 
          title="Privacy" 
        />
        <ProfileItem 
          icon={<Bell size={20} color="#9CA3AF" />} 
          title="Notifications" 
        />
        <ProfileItem 
          icon={<Settings size={20} color="#9CA3AF" />} 
          title="Settings" 
        />

        <View className="pt-6">
          <TouchableOpacity 
            className="bg-white p-4 rounded-2xl flex-row items-center justify-between shadow-sm border border-red-50"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <View className="bg-red-50 p-2 rounded-lg mr-3">
                <LogOut color="#ef4444" size={20} />
              </View>
              <Text className="text-red-500 font-bold text-base">Sign Out</Text>
            </View>
            <ChevronRight color="#ef4444" size={16} />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-muted text-xs mt-8 mb-10">
          Task Manager Mobile v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const ProfileItem = ({ icon, title, value }: { icon: React.ReactNode, title: string, value?: string }) => (
  <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center justify-between shadow-sm mb-3">
    <View className="flex-row items-center">
      <View className="bg-slate-50 p-2 rounded-lg mr-3">
        {icon}
      </View>
      <Text className="text-text font-medium text-base">{title}</Text>
    </View>
    <View className="flex-row items-center">
      {value ? <Text className="text-muted text-sm mr-2">{value}</Text> : null}
      <ChevronRight color="#E0DFD8" size={16} />
    </View>
  </TouchableOpacity>
);

export default ProfileScreen;
