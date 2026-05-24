import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../api/axios';
import { X, Send, Bot, User as UserIcon } from 'lucide-react-native';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  message: string;
}

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
}

const Chatbot = ({ visible, onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        message: 'Hello! I am your TaskFlow assistant. How can I help you today?'
      }]);
    }
  }, [visible]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      message: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/', { message: input });
      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        message: response.data.message
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-[32px] h-[90%] flex-col">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
            <View className="flex-row items-center">
              <View className="bg-primary/10 p-2 rounded-xl mr-3">
                <Bot color="#0097A7" size={24} />
              </View>
              <View>
                <Text className="text-lg font-bold text-text">AI Assistant</Text>
                <Text className="text-xs text-green-500 font-bold">Online</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView 
            className="flex-1 p-4"
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                className={`mb-4 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-2 self-end">
                    <Bot size={16} color="#0097A7" />
                  </View>
                )}
                <View 
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary rounded-tr-none' 
                      : 'bg-slate-100 rounded-tl-none'
                  }`}
                >
                  <Text className={`${msg.role === 'user' ? 'text-white' : 'text-text'}`}>
                    {msg.message}
                  </Text>
                </View>
                {msg.role === 'user' && (
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center ml-2 self-end">
                    <UserIcon size={16} color="#0097A7" />
                  </View>
                )}
              </View>
            ))}
            {loading && (
              <View className="flex-row justify-start mb-4">
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-2 self-end">
                  <Bot size={16} color="#0097A7" />
                </View>
                <View className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
                  <ActivityIndicator size="small" color="#0097A7" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="p-4 border-t border-slate-100 flex-row items-center mb-6">
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900"
              placeholder="Ask me anything..."
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              className={`ml-3 p-4 rounded-2xl ${!input.trim() || loading ? 'bg-slate-200' : 'bg-primary'}`}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default Chatbot;
