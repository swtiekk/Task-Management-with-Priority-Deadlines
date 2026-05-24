import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useCreateProject } from '../../hooks/useData';
import { X } from 'lucide-react-native';

interface ProjectFormProps {
  visible: boolean;
  onClose: () => void;
}

const ProjectForm = ({ visible, onClose }: ProjectFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(0);
  const createProject = useCreateProject();

  const handleSubmit = async () => {
    if (!name) return;
    
    try {
      await createProject.mutateAsync({ name, description, color });
      setName('');
      setDescription('');
      setColor(0);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const colors = ['#0097A7', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[32px] p-6 h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-text">New Project</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-6">
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Project Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  placeholder="e.g., Marketing Campaign"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 h-24"
                  placeholder="What is this project about?"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Project Color</Text>
                <View className="flex-row justify-between">
                  {colors.map((c, index) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setColor(index)}
                      className={`w-10 h-10 rounded-full items-center justify-center ${color === index ? 'border-2 border-slate-900' : ''}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === index && <View className="w-4 h-4 rounded-full bg-white/30" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className={`mt-10 p-4 rounded-xl items-center flex-row justify-center ${!name || createProject.isPending ? 'bg-primary/60' : 'bg-primary'}`}
              onPress={handleSubmit}
              disabled={!name || createProject.isPending}
            >
              {createProject.isPending && <ActivityIndicator color="white" className="mr-2" />}
              <Text className="text-white font-bold text-lg">
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProjectForm;
