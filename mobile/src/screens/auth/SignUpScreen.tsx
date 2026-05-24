import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AlertCircle } from 'lucide-react-native';
import api from '../../api/axios';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/users/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      // Auto login after signup
      await login(email, password);
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 py-12 justify-center">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900 mb-2">Create Account</Text>
          <Text className="text-slate-400">Sign up to start managing your tasks</Text>
        </View>

        <View className="space-y-4 mb-6">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

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
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-bold text-lg">
            {loading ? 'Creating account...' : 'Sign up →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-8 items-center"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-slate-400">
            Already have an account? <Text className="text-primary font-bold">Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
