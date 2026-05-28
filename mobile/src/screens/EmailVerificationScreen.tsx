import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../api/axios';
import { colors, screen } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError('');
    try {
      await api.post('/v1/auth/users/resend_activation/', { email });
      setResendSuccess(true);
    } catch {
      setError('Could not resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={screen.safe}>
      <View style={styles.brandPanel}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="mark-email-unread" size={32} color="#fff" />
        </View>
        <Text style={styles.brandTitle}>Check your email</Text>
        <Text style={styles.brandSub}>
          We sent a verification link to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verify your account</Text>
        <Text style={styles.cardSub}>
          Click the link in the email to activate your account. Once verified, come back and sign in.
        </Text>

        {!!error && (
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {resendSuccess && (
          <View style={styles.successCard}>
            <MaterialIcons name="check-circle-outline" size={16} color={colors.success} />
            <Text style={styles.successText}>Verification email resent!</Text>
          </View>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={resending}>
          {resending
            ? <ActivityIndicator color={colors.teal} />
            : <Text style={styles.secondaryButtonText}>Didn't get the email? Resend</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandPanel: {
    backgroundColor: colors.teal,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  brandSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    marginTop: -60,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 40,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textHint,
    lineHeight: 20,
    marginBottom: 24,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#F4C7C5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.danger,
    flex: 1,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#B8E8D7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.success,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.teal,
    fontWeight: '700',
  },
});