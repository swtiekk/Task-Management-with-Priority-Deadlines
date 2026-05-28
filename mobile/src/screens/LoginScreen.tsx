import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import api from '../api/axios';
import { colors, screen } from '../theme';

import { clearSession, storeSession } from '../api/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await clearSession();
      const tokenRes = await api.post('/v1/auth/jwt/create/', { email, password });
      const token = tokenRes.data.access;
      const refreshToken = tokenRes.data.refresh;
      const userRes = await axios.get(`${api.defaults.baseURL}/v1/auth/users/me/`, {
        headers: { Authorization: `JWT ${token}` },
      });
      await storeSession(token, userRes.data, refreshToken);
      
      // Updated navigation after successful login
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (loginError: any) {
      console.error('Login failed', loginError);
      setError(loginError.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={screen.safe}>
      <KeyboardAvoidingView style={screen.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.shell}>
            <View style={styles.brandPanel}>
              <View style={styles.brandInner}>
                <View style={styles.brandIcon}>
                  <MaterialIcons name="monitor" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.brandTitle}>TaskFlow</Text>
                <Text style={styles.brandSubtitle}>Manage tasks smarter, deliver projects faster.</Text>
                {[
                  'Priority-based task management',
                  'Deadline tracking and overdue alerts',
                  'Project-focused workflow',
                  'Real-time activity overview',
                ].map((item) => (
                  <View key={item} style={styles.featureRow}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSubtitle}>Sign in with your email to continue.</Text>

              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textHint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.inputWithAction}
                  placeholder="********"
                  placeholderTextColor={colors.textHint}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.inputAction} onPress={() => setShowPassword((current) => !current)}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={colors.textHint} />
                </TouchableOpacity>
              </View>

              {!!error && (
                <View style={styles.errorCard}>
                  <MaterialIcons name="error-outline" size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.submitButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Sign In</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.linkText}>
                  Don't have an account? <Text style={styles.linkAccent}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  shell: {
    minHeight: '100%',
  },
  brandPanel: {
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 150,
  },
  brandInner: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    marginTop: 10,
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.76)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
  },
  formCard: {
    marginTop: -108,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 40,
    elevation: 6,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  formSubtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    color: colors.textHint,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputWithAction: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  inputAction: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4C7C5',
    backgroundColor: colors.dangerLight,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 10,
    color: colors.danger,
    flex: 1,
    fontSize: 13,
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: colors.teal,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textHint,
  },
  linkAccent: {
    color: colors.teal,
    fontWeight: '700',
  },
});