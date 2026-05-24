import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 justify-center">
        <View className="mb-10">
          <View className="w-12 h-12 bg-primary/20 rounded-2xl items-center justify-center mb-6">
            <Text className="text-primary text-2xl font-bold">T</Text>
          </View>
          <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome back</Text>
          <Text className="text-slate-400">Sign in with your email to continue</Text>
        </View>

        <View className="space-y-4 mb-6">
          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email address</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {error ? (
          <View className="flex-row items-center bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
            <AlertCircle color="#ef4444" size={18} />
            <Text className="text-red-600 ml-2 font-medium flex-1">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          className={`p-4 rounded-xl items-center flex-row justify-center ${loading ? 'bg-primary/60' : 'bg-primary'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-bold text-lg">
            {loading ? 'Signing in...' : 'Sign in →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-8 items-center"
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text className="text-slate-400">
            Don't have an account? <Text className="text-primary font-bold">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
