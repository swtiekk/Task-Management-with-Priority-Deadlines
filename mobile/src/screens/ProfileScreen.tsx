import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList } from '../../App';
import { TabParamList } from '../../App';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { colors, screen } from '../theme';
import { clearSession } from '../api/auth';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface Stats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface UserResponse {
  email: string;
  username?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

interface UserProfile {
  name: string;
  role: string;
  email: string;
  username: string;
  address: string;
  age: string;
  birthday: string;
  joinedDate: string;
  admin: boolean;
  notifications: boolean;
  privacyMode: boolean;
}

const defaultProfile: UserProfile = {
  name: 'TaskFlow User',
  role: 'Team Member',
  email: '',
  username: '',
  address: '',
  age: '',
  birthday: '',
  joinedDate: 'March 2024',
  admin: false,
  notifications: true,
  privacyMode: false,
};

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [draft, setDraft] = useState<UserProfile>(defaultProfile);
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    try {
      setProfile(defaultProfile);
      setDraft(defaultProfile);
      const [meRes, savedProfile] = await Promise.all([
        api.get('/v1/auth/users/me/'),
        SecureStore.getItemAsync('user_profile'),
      ]);

      const me: UserResponse = meRes.data;
      const parsedSaved = savedProfile ? JSON.parse(savedProfile) as Partial<UserProfile> : {};
      const nameFromApi = me.name || [me.first_name, me.last_name].filter(Boolean).join(' ').trim();

      const merged: UserProfile = {
        ...defaultProfile,
        ...parsedSaved,
        name: parsedSaved.name || nameFromApi || me.email || defaultProfile.name,
        email: me.email || parsedSaved.email || '',
        username: me.username || parsedSaved.username || '',
      };

      setProfile(merged);
      setDraft(merged);
      await SecureStore.setItemAsync('user', JSON.stringify(me));
      await SecureStore.setItemAsync('user_profile', JSON.stringify(merged));
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/tasks/');
      const tasks = response.data;
      const completed = tasks.filter((task: any) => task.status === 'Completed').length;
      const overdue = tasks.filter((task: any) => task.is_overdue).length;
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: tasks.length - completed,
        overdueTasks: overdue,
      });
    } catch (error) {
      console.error('Failed to load profile stats', error);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([loadProfile(), loadStats()]);
      setLoading(false);
    };
    run();
  }, []);

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setProfile(draft);
    await SecureStore.setItemAsync('user_profile', JSON.stringify(draft));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const togglePreference = async (key: 'notifications' | 'privacyMode') => {
    const next = { ...profile, [key]: !profile[key] };
    setProfile(next);
    setDraft(next);
    await SecureStore.setItemAsync('user_profile', JSON.stringify(next));
  };

  const handleLogout = async () => {
    setProfile(defaultProfile);
    setDraft(defaultProfile);
    setStats({
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
    });
    await clearSession();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });

  };

  if (loading) {
    return (
      <SafeAreaView style={screen.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screen.safe}>
      <ScrollView style={screen.body} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>My Profile</Text>
          <Text style={styles.heroMeta}>
            {isEditing ? 'Editing your personal information' : 'Manage your personal information and preferences'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.profileCard, screen.card, screen.shadow]}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials || 'TF'}</Text>
            </View>

            {isEditing ? (
              <>
                <TextInput style={styles.centerInput} value={draft.name} onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))} />
                <TextInput style={[styles.centerInput, styles.centerInputSub]} value={draft.role} onChangeText={(value) => setDraft((current) => ({ ...current, role: value }))} />
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileRole}>{profile.role}</Text>
              </>
            )}

            <View style={styles.actionRow}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={styles.secondaryAction} onPress={handleCancel}>
                    <Text style={styles.secondaryActionText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryAction} onPress={handleSave}>
                    <Text style={styles.primaryActionText}>Save Changes</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.primaryActionFull} onPress={() => setIsEditing(true)}>
                  <MaterialIcons name="settings" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statGrid}>
            {[
              { label: 'Completed', value: `${stats.completedTasks}`, note: 'Tasks finished successfully', color: colors.teal, bg: colors.infoLight, icon: 'task-alt' as const },
              { label: 'Pending', value: `${stats.pendingTasks}`, note: 'Tasks currently in progress', color: colors.warning, bg: colors.warningLight, icon: 'schedule' as const },
              { label: 'Overdue', value: `${stats.overdueTasks}`, note: 'Tasks past their deadline', color: colors.danger, bg: colors.dangerLight, icon: 'notifications-active' as const },
              { label: 'Total Tasks', value: `${stats.totalTasks}`, note: 'Assigned across all projects', color: colors.textMuted, bg: colors.surfaceMuted, icon: 'list-alt' as const },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, screen.card]}>
                <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statTitle}>{item.label}</Text>
                <Text style={styles.statNote}>{item.note}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.sectionCard, screen.card]}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            {[
              { key: 'email', label: 'Email', icon: 'mail-outline' as const, editable: true },
              { key: 'username', label: 'Username', icon: 'alternate-email' as const, editable: false },
              { key: 'address', label: 'Address', icon: 'place' as const, editable: true },
              { key: 'age', label: 'Age', icon: 'person-outline' as const, editable: true },
              { key: 'birthday', label: 'Birthday', icon: 'event' as const, editable: true },
              { key: 'joinedDate', label: 'Joined', icon: 'calendar-today' as const, editable: false },
            ].map((item) => (
              <View key={item.key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                {isEditing && item.editable ? (
                  <TextInput
                    style={styles.infoInput}
                    value={draft[item.key as keyof UserProfile] as string}
                    onChangeText={(value) => setDraft((current) => ({ ...current, [item.key]: value }))}
                  />
                ) : (
                  <View style={styles.infoValueRow}>
                    <MaterialIcons name={item.icon} size={16} color={colors.teal} />
                    <Text style={styles.infoValue}>
                      {(profile[item.key as keyof UserProfile] as string) || '-'}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <View style={styles.infoValueRow}>
                <MaterialIcons name="shield" size={16} color={colors.teal} />
                <Text style={styles.infoValue}>{profile.admin ? 'Administrator' : 'User'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, screen.card]}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            {[
              { key: 'notifications', label: 'Email Notifications', description: 'Receive daily summary of tasks' },
              { key: 'privacyMode', label: 'Privacy Mode', description: 'Hide task details from others' },
            ].map((item) => (
              <View key={item.key} style={styles.preferenceRow}>
                <View style={styles.preferenceCopy}>
                  <Text style={styles.preferenceTitle}>{item.label}</Text>
                  <Text style={styles.preferenceText}>{item.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, profile[item.key as 'notifications' | 'privacyMode'] && styles.toggleActive]}
                  onPress={() => togglePreference(item.key as 'notifications' | 'privacyMode')}
                >
                  <View style={[styles.toggleKnob, profile[item.key as 'notifications' | 'privacyMode'] && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.logoutButton, screen.card]} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 52,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroMeta: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.74)',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -30,
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  profileRole: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textHint,
  },
  centerInput: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  centerInputSub: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    width: '100%',
  },
  primaryActionFull: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.teal,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryAction: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.success,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  primaryActionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    width: '48.5%',
    padding: 16,
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statNote: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textHint,
  },
  sectionCard: {
    padding: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  infoInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  preferenceCopy: {
    flex: 1,
    paddingRight: 12,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  preferenceText: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textHint,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#DDE3E8',
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.teal,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
});