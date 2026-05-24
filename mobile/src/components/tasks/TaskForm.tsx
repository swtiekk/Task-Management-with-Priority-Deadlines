import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useCreateTask } from '../../hooks/useData';
import { X, Calendar } from 'lucide-react-native';
import { TaskPriority } from '../../types';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  projectId: number;
}

const TaskForm = ({ visible, onClose, projectId }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const createTask = useCreateTask();

  const handleSubmit = async () => {
    if (!title || !deadline) return;
    
    try {
      await createTask.mutateAsync({ 
        title, 
        description, 
        priority, 
        deadline,
        project: projectId,
        status: 'Pending'
      });
      setTitle('');
      setDescription('');
      setPriority('Medium');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-text">Add Task</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-6">
              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Task Title</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                  placeholder="e.g., Design new logo"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 h-24"
                  placeholder="Add some details..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</Text>
                <View className="flex-row space-x-2">
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      className={`flex-1 p-3 rounded-xl items-center border ${priority === p ? getPriorityBorder(p) : 'border-slate-200 bg-white'}`}
                    >
                      <Text className={`font-bold ${priority === p ? getPriorityText(p) : 'text-slate-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deadline (YYYY-MM-DD)</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <Calendar size={18} color="#9CA3AF" className="mr-3" />
                  <TextInput
                    className="flex-1 text-slate-900"
                    placeholder="2025-12-31"
                    value={deadline}
                    onChangeText={setDeadline}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className={`mt-10 p-4 rounded-xl items-center flex-row justify-center ${!title || createTask.isPending ? 'bg-primary/60' : 'bg-primary'}`}
              onPress={handleSubmit}
              disabled={!title || createTask.isPending}
            >
              {createTask.isPending && <ActivityIndicator color="white" className="mr-2" />}
              <Text className="text-white font-bold text-lg">
                {createTask.isPending ? 'Adding...' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getPriorityBorder = (priority: string) => {
  switch (priority) {
    case 'High': return 'border-red-500 bg-red-50';
    case 'Medium': return 'border-amber-500 bg-amber-50';
    default: return 'border-blue-500 bg-blue-50';
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'High': return 'text-red-600';
    case 'Medium': return 'text-amber-600';
    default: return 'text-blue-600';
  }
};

export default TaskForm;
