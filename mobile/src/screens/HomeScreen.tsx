import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RootStackParamList } from '../../App';
import { TabParamList } from '../../App';
import api from '../api/axios';
import { colors, formatDate, getGreeting, getProjectPalette, priorityTone, screen } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface Project {
  id: number;
  name: string;
  description: string;
  color: number;
  total_tasks: number;
  overdue_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
}

interface Task {
  id: number;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  is_overdue: boolean;
  project: number;
}

export default function HomeScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalOverdue = projects.reduce((sum, project) => sum + project.overdue_tasks, 0);
  const totalTasks = projects.reduce((sum, project) => sum + project.total_tasks, 0);
  const totalCompleted = projects.reduce((sum, project) => sum + (project.completed_tasks ?? 0), 0);
  const totalInProgress = recentTasks.filter((task) => task.status === 'In Progress').length;

  const fetchData = async () => {
    try {
      const [projectRes, taskRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/tasks/'),
      ]);
      setProjects(projectRes.data);
      setRecentTasks(taskRes.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load home data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <ScrollView
        style={screen.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.teal} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>{getGreeting()}</Text>
            <Text style={styles.heroTitle}>Overview</Text>
            <Text style={styles.heroMeta}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} | {totalTasks} tasks total
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statGrid}>
            {[
              { label: 'Total Tasks', value: `${totalTasks}`, sub: 'across all projects', color: colors.text, bar: colors.teal, bg: colors.surface },
              { label: 'In Progress', value: `${totalInProgress}`, sub: 'active right now', color: colors.info, bar: colors.info, bg: colors.infoLight },
              { label: 'Completed', value: `${totalCompleted}`, sub: 'finished work', color: colors.success, bar: colors.success, bg: colors.successLight },
              { label: 'Overdue', value: `${totalOverdue}`, sub: 'past deadline', color: colors.danger, bar: colors.danger, bg: colors.dangerLight },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, screen.shadow, { backgroundColor: item.bg }]}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statSub}>{item.sub}</Text>
                <View style={[styles.statBar, { backgroundColor: item.bar }]} />
              </View>
            ))}
          </View>

          {totalOverdue > 0 && (
            <View style={styles.alertCard}>
              <View style={styles.alertIcon}>
                <MaterialIcons name="warning-amber" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>
                  {totalOverdue} task{totalOverdue !== 1 ? 's' : ''} past deadline
                </Text>
                <Text style={styles.alertText}>Review and reschedule to keep projects on track.</Text>
              </View>
              <TouchableOpacity style={styles.alertAction} onPress={() => navigation.navigate('Overdue')}>
                <Text style={styles.alertActionText}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          {projects.length === 0 ? (
            <View style={[styles.emptyState, screen.card]}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="folder-open" size={26} color={colors.teal} />
              </View>
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptyText}>Create your first project to get started.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Projects')}>
                <Text style={styles.primaryButtonText}>Create a Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Recent Tasks Panel */}
              <View style={[styles.panel, screen.card]}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>Recent Tasks</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                    <Text style={styles.panelAction}>View all</Text>
                  </TouchableOpacity>
                </View>
                {recentTasks.length === 0 ? (
                  <Text style={styles.panelEmpty}>No tasks yet</Text>
                ) : recentTasks.map((task, index) => {
                  const tone = priorityTone(task.priority);
                  const projectName = projects.find((project) => project.id === task.project)?.name ?? 'Project';
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[styles.taskRow, index < recentTasks.length - 1 && styles.rowDivider]}
                      onPress={() => navigation.navigate('ProjectDetail', { id: task.project })}
                    >
                      <View style={[styles.taskBullet, task.status === 'Completed' && styles.taskBulletDone]}>
                        {task.status === 'Completed' && <MaterialIcons name="check" size={10} color="#FFFFFF" />}
                      </View>
                      <View style={styles.taskMain}>
                        <Text style={[styles.taskTitle, task.status === 'Completed' && styles.taskTitleDone, task.is_overdue && styles.taskTitleOverdue]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View style={styles.taskMetaRow}>
                          <Text style={styles.taskProject} numberOfLines={1}>{projectName}</Text>
                          <View style={[styles.miniPill, { backgroundColor: tone.bg }]}>
                            <Text style={[styles.miniPillText, { color: tone.text }]}>{task.priority}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.taskDate, task.is_overdue && styles.taskDateOverdue]}>
                        {task.is_overdue ? 'Late ' : ''}{formatDate(task.deadline)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Compact Projects at a Glance */}
              <View style={[styles.panel, screen.card]}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>Projects at a Glance</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                    <Text style={styles.panelAction}>Manage</Text>
                  </TouchableOpacity>
                </View>
                {projects.length === 0 ? (
                  <Text style={styles.panelEmpty}>No projects yet</Text>
                ) : (
                  <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
                    {projects.slice(0, 3).map((project) => {
                      const palette = getProjectPalette(project);
                      return (
                        <View key={project.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: palette.dot, marginRight: 10 }} />
                          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                            {project.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: palette.dot, fontWeight: '700' }}>
                            {project.completion_percentage ?? 0}%
                          </Text>
                        </View>
                      );
                    })}
                    {projects.length > 3 && (
                      <Text style={{ fontSize: 12, color: colors.textHint, marginTop: 4 }}>
                        +{projects.length - 3} more
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </>
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
    paddingBottom: 30,
  },
  hero: {
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
  },
  heroCopy: {
    flex: 1,
  },
  heroKicker: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroMeta: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -34,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    width: '48.5%',
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
    lineHeight: 32,
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
  alertCard: {
    backgroundColor: colors.dangerLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F4C7C5',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertBody: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  alertText: {
    marginTop: 2,
    fontSize: 12,
    color: colors.danger,
  },
  alertAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAB4B0',
    backgroundColor: colors.surface,
    marginLeft: 10,
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  emptyState: {
    padding: 28,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.infoLight,
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
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHint,
    textAlign: 'center',
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
  panel: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  panelAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal,
  },
  panelEmpty: {
    padding: 24,
    textAlign: 'center',
    color: colors.textHint,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  taskBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBulletDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskMain: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  taskTitleDone: {
    color: colors.textHint,
    textDecorationLine: 'line-through',
  },
  taskTitleOverdue: {
    color: colors.danger,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  taskProject: {
    flex: 1,
    fontSize: 12,
    color: colors.textHint,
    marginRight: 8,
  },
  miniPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskDate: {
    fontSize: 11,
    color: colors.textHint,
  },
  taskDateOverdue: {
    color: colors.danger,
    fontWeight: '700',
  },
});