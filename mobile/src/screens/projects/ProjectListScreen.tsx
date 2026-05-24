import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useProjects } from '../../hooks/useData';
import { Plus, ChevronRight, Layout } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProjectStackParamList } from '../../navigation/AppTabs';

import ProjectForm from '../../components/projects/ProjectForm';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectList'>;

const ProjectListScreen = ({ navigation }: Props) => {
  const { data: projects, isLoading, refetch } = useProjects();
  const [isFormVisible, setIsFormVisible] = React.useState(false);

  if (isLoading && !projects) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0097A7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-text">Your Projects</Text>
        <TouchableOpacity 
          className="bg-primary p-2 rounded-full"
          onPress={() => setIsFormVisible(true)}
        >
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <ProjectForm 
        visible={isFormVisible} 
        onClose={() => setIsFormVisible(false)} 
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="bg-white p-8 rounded-2xl items-center justify-center border border-dashed border-muted mt-4">
            <Layout size={40} color="#9CA3AF" />
            <Text className="text-muted mt-4 font-medium">No projects found.</Text>
            <Text className="text-muted text-xs text-center mt-1">Create your first project to start organizing tasks.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white p-5 rounded-2xl mb-4 shadow-sm flex-row items-center justify-between border-l-4"
            style={{ borderLeftColor: getColorHex(item.color) }}
            onPress={() => navigation.navigate('ProjectDetail', { id: item.id, name: item.name })}
          >
            <View className="flex-1">
              <Text className="text-lg font-bold text-text mb-1">{item.name}</Text>
              <Text className="text-muted text-sm" numberOfLines={1}>{item.description || 'No description'}</Text>
              
              <View className="flex-row items-center mt-3">
                <View className="bg-slate-100 px-2 py-1 rounded-md mr-3">
                  <Text className="text-slate-500 text-xs font-bold">{item.total_tasks} Tasks</Text>
                </View>
                <View className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-primary" 
                    style={{ width: `${item.completion_percentage}%` }} 
                  />
                </View>
                <Text className="text-primary text-xs font-bold ml-2">{item.completion_percentage}%</Text>
              </View>
            </View>
            <ChevronRight color="#E0DFD8" size={20} className="ml-4" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Helper for project colors (matching web logic if possible)
const getColorHex = (colorIndex: number) => {
  const colors = ['#0097A7', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  return colors[colorIndex % colors.length];
};

export default ProjectListScreen;
