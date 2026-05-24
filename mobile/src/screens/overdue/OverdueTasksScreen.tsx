import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTasks, useUpdateTask } from '../../hooks/useData';
import { AlertTriangle, CheckCircle2, Circle, Clock } from 'lucide-react-native';
import { Task } from '../../types';

const OverdueTasksScreen = () => {
  const { data: tasks, isLoading, refetch } = useTasks();
  const updateTask = useUpdateTask();

  const overdueTasks = tasks?.filter(t => t.is_overdue) || [];

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  if (isLoading && !tasks) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0097A7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="bg-red-50 p-6 rounded-2xl items-center justify-center border border-red-100 mb-6">
        <AlertTriangle color="#ef4444" size={32} />
        <Text className="text-red-800 font-bold mt-2 text-lg">
          {overdueTasks.length} Overdue Tasks
        </Text>
        <Text className="text-red-600 text-center text-sm mt-1">
          {overdueTasks.length > 0 
            ? "These tasks have passed their deadlines. Complete them as soon as possible."
            : "Great job! You're all caught up with your deadlines."}
        </Text>
      </View>

      <FlatList
        data={overdueTasks}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm flex-row items-center border-l-4 border-red-500">
            <TouchableOpacity 
              onPress={() => toggleTaskStatus(item)}
              className="mr-3"
            >
              <Circle color="#E0DFD8" size={24} />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-base font-bold text-text" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <Clock size={12} color="#ef4444" />
                <Text className="text-xs ml-1 font-medium text-red-500">
                  Due {new Date(item.deadline).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default OverdueTasksScreen;
