import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../api/axios';
import { colors, daysLate, formatDate, priorityTone, screen } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Overdue'>;

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  project: number;
  is_overdue: boolean;
}

interface Project {
  id: number;
  name: string;
}

export default function OverdueScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filterPriority, setFilterPriority] = useState<'' | 'High' | 'Medium' | 'Low'>('');

  const fetchData = async () => {
    try {
      const [overdueRes, projectRes] = await Promise.all([
        api.get('/tasks/overdue/'),
        api.get('/projects/'),
      ]);
      setTasks(overdueRes.data.tasks ?? overdueRes.data);
      setProjects(projectRes.data);
      setError('');
    } catch (fetchError) {
      console.error('Failed to load overdue tasks', fetchError);
      setError('Failed to load overdue tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => (
    filterPriority ? tasks.filter((task) => task.priority === filterPriority) : tasks
  ), [filterPriority, tasks]);

  const avgDays = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + daysLate(task.deadline), 0) / tasks.length)
    : 0;
  const highCount = tasks.filter((task) => task.priority === 'High').length;
  const medCount = tasks.filter((task) => task.priority === 'Medium').length;

  const getProjectName = (projectId: number) => projects.find((project) => project.id === projectId)?.name ?? `Project #${projectId}`;

  if (loading) {
    return (
      <SafeAreaView style={screen.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.danger} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screen.safe}>
      <ScrollView
        style={screen.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.danger} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <View style={styles.heroTitleRow}>
                <View style={styles.heroIcon}>
                  <MaterialIcons name="schedule" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.heroTitle}>Overdue Tasks</Text>
              </View>
              <Text style={styles.heroMeta}>Tasks that have passed their deadline.</Text>
            </View>
            <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.heroButtonText}>Overview</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', 'High', 'Medium', 'Low'] as const).map((option) => {
              const active = (option === 'All' && !filterPriority) || option === filterPriority;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setFilterPriority(option === 'All' ? '' : option)}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.content}>
          <View style={styles.statGrid}>
            {[
              { label: 'Total Overdue', value: `${tasks.length}`, sub: 'tasks past deadline', color: colors.danger, bar: colors.danger, bg: colors.dangerLight },
              { label: 'Avg Days Late', value: `${avgDays}`, sub: 'days behind schedule', color: colors.warning, bar: colors.warning, bg: colors.warningLight },
              { label: 'High Priority', value: `${highCount}`, sub: `+ ${medCount} medium priority`, color: colors.danger, bar: colors.danger, bg: colors.surface },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, screen.shadow, { backgroundColor: item.bg }]}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statSub}>{item.sub}</Text>
                <View style={[styles.statBar, { backgroundColor: item.bar }]} />
              </View>
            ))}
          </View>

          {!!error && (
            <View style={styles.errorCard}>
              <MaterialIcons name="warning-amber" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {filteredTasks.length === 0 ? (
            <View style={[styles.emptyState, screen.card]}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="task-alt" size={28} color={colors.success} />
              </View>
              <Text style={styles.emptyTitle}>No overdue tasks</Text>
              <Text style={styles.emptyText}>You're all caught up.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.primaryButtonText}>Back to Overview</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const priority = priorityTone(task.priority);
              const lateDays = daysLate(task.deadline);
              const urgencyColor = lateDays > 14 ? colors.dangerDeep : lateDays > 7 ? colors.danger : colors.warning;
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskCard, screen.card]}
                  onPress={() => navigation.navigate('ProjectDetail', { id: task.project })}
                >
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.daysPill, { backgroundColor: `${urgencyColor}18`, borderColor: `${urgencyColor}33` }]}>
                      <Text style={[styles.daysPillText, { color: urgencyColor }]}>{lateDays}d late</Text>
                    </View>
                  </View>
                  {!!task.description && (
                    <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
                  )}
                  <Text style={styles.projectName}>{getProjectName(task.project)}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
                      <Text style={[styles.priorityPillText, { color: priority.text }]}>{task.priority}</Text>
                    </View>
                    <View style={styles.deadlineRow}>
                      <MaterialIcons name="warning-amber" size={14} color={colors.danger} />
                      <Text style={styles.deadlineText}>Due {formatDate(task.deadline)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 54,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroMeta: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.74)',
  },
  heroButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterRow: {
    paddingTop: 18,
    paddingRight: 12,
  },
  filterPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.86)',
  },
  filterPillTextActive: {
    color: colors.danger,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -34,
  },
  statGrid: {
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  statValue: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '700',
  },
  statSub: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textHint,
  },
  statBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F4C7C5',
    backgroundColor: colors.dangerLight,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorText: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.danger,
    flex: 1,
  },
  emptyState: {
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: colors.textHint,
  },
  primaryButton: {
    backgroundColor: colors.teal,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 12,
  },
  daysPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  daysPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  projectName: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textHint,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 5,
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
});
