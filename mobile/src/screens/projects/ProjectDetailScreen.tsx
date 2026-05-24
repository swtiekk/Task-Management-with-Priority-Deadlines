import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useProject, useUpdateTask, useDeleteTask } from '../../hooks/useData';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../../navigation/AppTabs';
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react-native';
import { Task } from '../../types';

import TaskForm from '../../components/tasks/TaskForm';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectDetail'>;

const ProjectDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { data: project, isLoading, refetch } = useProject(id);
  const [isFormVisible, setIsFormVisible] = React.useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask.mutate(taskId);
  };

  if (isLoading && !project) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0097A7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <TaskForm 
        visible={isFormVisible} 
        onClose={() => setIsFormVisible(false)} 
        projectId={id}
      />
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-6 shadow-sm">
        <TouchableOpacity 
          className="flex-row items-center mb-4" 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#0097A7" size={20} />
          <Text className="text-primary font-bold ml-1">Back to Projects</Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text mb-1">{project?.name}</Text>
            <Text className="text-muted text-sm">{project?.description || 'No description provided.'}</Text>
          </View>
          <TouchableOpacity 
            className="bg-primary p-3 rounded-2xl shadow-sm"
            onPress={() => setIsFormVisible(true)}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row items-center">
          <View className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <View 
              className="h-full bg-primary" 
              style={{ width: `${project?.completion_percentage}%` }} 
            />
          </View>
          <Text className="text-primary text-sm font-bold ml-3">{project?.completion_percentage}% Done</Text>
        </View>
      </View>

      <FlatList
        data={project?.tasks}
        className="p-4"
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="bg-white p-8 rounded-2xl items-center justify-center border border-dashed border-muted mt-2">
            <Text className="text-muted font-medium">No tasks yet.</Text>
            <Text className="text-muted text-xs text-center mt-1">Tap the + button to add a task to this project.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm flex-row items-center">
            <TouchableOpacity 
              onPress={() => toggleTaskStatus(item)}
              className="mr-3"
            >
              {item.status === 'Completed' ? (
                <CheckCircle2 color="#22c55e" size={24} />
              ) : (
                <Circle color="#E0DFD8" size={24} />
              )}
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text 
                className={`text-base font-bold text-text ${item.status === 'Completed' ? 'line-through text-muted' : ''}`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <Clock size={12} color={item.is_overdue ? '#ef4444' : '#9CA3AF'} />
                <Text className={`text-xs ml-1 font-medium ${item.is_overdue ? 'text-red-500' : 'text-muted'}`}>
                  {new Date(item.deadline).toLocaleDateString()}
                </Text>
                <View className="mx-2 w-1 h-1 bg-slate-200 rounded-full" />
                <Text 
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getPriorityColor(item.priority)}`}
                >
                  {item.priority}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => handleDeleteTask(item.id)}
              className="p-2"
            >
              <Trash2 color="#ef4444" size={18} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-600';
    case 'Medium': return 'bg-amber-100 text-amber-600';
    default: return 'bg-blue-100 text-blue-600';
  }
};

export default ProjectDetailScreen;
