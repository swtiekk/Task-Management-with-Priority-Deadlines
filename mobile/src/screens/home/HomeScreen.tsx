import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTasks } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clock, ListTodo, AlertCircle, Bot } from 'lucide-react-native';
import Chatbot from '../../components/common/Chatbot';

const HomeScreen = () => {
  const { user } = useAuth();
  const { data: tasks, isLoading, isError, refetch } = useTasks();
  const [isChatVisible, setIsChatVisible] = React.useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0097A7" />
      </View>
    );
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
  const overdueTasks = tasks?.filter(t => t.is_overdue).length || 0;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <View className="flex-1">
      <ScrollView 
        className="flex-1 bg-background p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-2xl font-bold text-text mb-1">Welcome, {user?.first_name}!</Text>
          <Text className="text-muted">You have {pendingTasks} tasks pending today.</Text>
        </View>
        
        <View className="flex-row flex-wrap justify-between">
          <StatsCard 
            title="Total Tasks" 
            value={totalTasks} 
            icon={<ListTodo size={20} color="#0097A7" />} 
            color="border-primary"
          />
          <StatsCard 
            title="Completed" 
            value={completedTasks} 
            icon={<CheckCircle2 size={20} color="#22c55e" />} 
            color="border-green-500"
          />
          <StatsCard 
            title="Pending" 
            value={pendingTasks} 
            icon={<Clock size={20} color="#f59e0b" />} 
            color="border-amber-500"
          />
          <StatsCard 
            title="Overdue" 
            value={overdueTasks} 
            icon={<AlertCircle size={20} color="#ef4444" />} 
            color="border-red-500"
          />
        </View>

        {isError && (
          <View className="bg-red-50 p-4 rounded-xl mt-4 border border-red-100 flex-row items-center">
            <AlertCircle color="#ef4444" size={20} />
            <Text className="text-red-600 ml-2">Failed to load dashboard data.</Text>
          </View>
        )}
      </ScrollView>

      {/* Chatbot FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => setIsChatVisible(true)}
      >
        <Bot color="white" size={28} />
      </TouchableOpacity>

      <Chatbot 
        visible={isChatVisible} 
        onClose={() => setIsChatVisible(false)} 
      />
    </View>
  );
};

const StatsCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <View className={`bg-white p-4 rounded-xl w-[48%] mb-4 shadow-sm border-l-4 ${color}`}>
    <View className="flex-row justify-between items-start mb-2">
      {icon}
      <Text className="text-2xl font-bold text-text">{value}</Text>
    </View>
    <Text className="text-muted text-xs uppercase font-bold tracking-wider">{title}</Text>
  </View>
);

export default HomeScreen;
