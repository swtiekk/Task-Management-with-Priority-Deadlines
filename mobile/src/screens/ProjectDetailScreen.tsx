import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../api/axios';
import { extractApiErrorMessage } from '../api/errors';
import {
  colors,
  daysLate,
  formatDate,
  getProjectPalette,
  isDueSoon,
  priorityTone,
  screen,
  statusTone,
  toInputDate,
} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

interface Project {
  id: number;
  name: string;
  description: string;
  color: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  is_overdue: boolean;
}

const statusOptions: Array<'' | 'Pending' | 'In Progress' | 'Completed'> = ['', 'Pending', 'In Progress', 'Completed'];
const priorityOptions: Array<'' | 'Low' | 'Medium' | 'High'> = ['', 'Low', 'Medium', 'High'];

export default function ProjectDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Pending' | 'In Progress' | 'Completed'>('');
  const [filterPriority, setFilterPriority] = useState<'' | 'Low' | 'Medium' | 'High'>('');
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'Pending',
    deadline: '',
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
  });

  const palette = getProjectPalette(project);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}/`);
      setProject(response.data);
      setProjectForm({
        name: response.data.name,
        description: response.data.description ?? '',
      });
    } catch (fetchError) {
      console.error('Failed to load project', fetchError);
      setError('Project not found.');
    }
  };

  const fetchTasks = async () => {
    try {
      const params: Record<string, string | number> = { project: id };
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterPriority) {
        params.priority = filterPriority;
      }

      const [filteredRes, allRes] = await Promise.all([
        api.get('/tasks/', { params }),
        api.get('/tasks/', { params: { project: id } }),
      ]);

      setTasks(filteredRes.data);
      setAllTasks(allRes.data);
    } catch (fetchError) {
      console.error('Failed to load tasks', fetchError);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAll = async () => {
    setError('');
    await Promise.all([fetchProject(), fetchTasks()]);
  };

  useEffect(() => {
    fetchAll();
  }, [id, filterStatus, filterPriority]);

  const totalAll = allTasks.length;
  const completedAll = allTasks.filter((task) => task.status === 'Completed').length;
  const inProgressAll = allTasks.filter((task) => task.status === 'In Progress').length;
  const overdueAll = allTasks.filter((task) => task.is_overdue).length;
  const pendingAll = allTasks.filter((task) => task.status === 'Pending').length;
  const pct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  const statusPills = useMemo(() => statusOptions.map((option) => ({
    key: option || 'All',
    label: option || 'All',
    active: option === filterStatus || (!option && !filterStatus),
    onPress: () => setFilterStatus(option),
  })), [filterStatus]);

  const priorityPills = useMemo(() => priorityOptions.map((option) => ({
    key: option || 'All',
    label: option || 'All',
    active: option === filterPriority || (!option && !filterPriority),
    onPress: () => setFilterPriority(option),
  })), [filterPriority]);

  const resetTaskForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Low',
      status: 'Pending',
      deadline: '',
    });
    setEditTask(null);
    setTaskModalVisible(false);
    setError('');
  };

  const openEditTask = (task: Task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      deadline: toInputDate(task.deadline),
    });
    setTaskModalVisible(true);
    setError('');
  };

  const handleTaskSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!formData.deadline) {
      setError('Deadline is required in YYYY-MM-DD format.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(`${formData.deadline}T00:00:00`);
    if (Number.isNaN(deadlineDate.getTime())) {
      setError('Deadline must be a valid date in YYYY-MM-DD format.');
      return;
    }
    if (deadlineDate < today) {
      setError('Deadline cannot be in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline,
      };

      if (editTask) {
        await api.patch(`/tasks/${editTask.id}/`, payload);
      } else {
        await api.post('/tasks/', { ...payload, project: id });
      }
      resetTaskForm();
      fetchTasks();
    } catch (submitError: any) {
      console.error('Failed to save task', submitError);
      setError(extractApiErrorMessage(submitError, 'Failed to save task.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    Alert.alert('Delete Task', 'Delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${taskId}/`);
            fetchTasks();
          } catch (deleteError) {
            console.error('Failed to delete task', deleteError);
            setError(extractApiErrorMessage(deleteError, 'Failed to delete task.'));
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.patch(`/tasks/${task.id}/`, { status: nextStatus });
      fetchTasks();
    } catch (toggleError) {
      console.error('Failed to update task status', toggleError);
      setError(extractApiErrorMessage(toggleError, 'Failed to update task.'));
    }
  };

  const handleProjectSave = async () => {
    if (!projectForm.name.trim()) {
      setError('Project name is required.');
      return;
    }

    setProjectSubmitting(true);
    try {
      const response = await api.patch(`/projects/${id}/`, projectForm);
      setProject(response.data);
      setProjectModalVisible(false);
      setError('');
    } catch (saveError) {
      console.error('Failed to update project', saveError);
      setError(extractApiErrorMessage(saveError, 'Failed to update project.'));
    } finally {
      setProjectSubmitting(false);
    }
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
      <ScrollView
        style={screen.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.teal} />}
      >
        <View style={[styles.hero, { backgroundColor: palette.dot }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Projects')}>
            <MaterialIcons name="arrow-back" size={16} color="#FFFFFF" />
            <Text style={styles.backText}>Projects</Text>
          </TouchableOpacity>

          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <View style={styles.titleRow}>
                <Text style={styles.heroTitle} numberOfLines={1}>{project?.name ?? 'Project'}</Text>
                <TouchableOpacity style={styles.editChip} onPress={() => setProjectModalVisible(true)}>
                  <MaterialIcons name="edit" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {!!project?.description && <Text style={styles.heroDescription}>{project.description}</Text>}
              <View style={styles.heroProgressRow}>
                <View style={styles.heroProgressTrack}>
                  <View style={[styles.heroProgressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.heroProgressText}>{pct}% complete</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => { setTaskModalVisible(true); setEditTask(null); setError(''); }}>
              <MaterialIcons name="add" size={18} color={palette.text} />
              <Text style={[styles.addButtonText, { color: palette.text }]}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statGrid}>
            {[
              { label: 'Total Tasks', value: `${totalAll}`, color: colors.text, bar: palette.dot, bg: colors.surface },
              { label: 'Pending', value: `${pendingAll}`, color: colors.textMuted, bar: colors.textMuted, bg: colors.surface },
              { label: 'In Progress', value: `${inProgressAll}`, color: colors.warning, bar: colors.warning, bg: colors.warningLight },
              { label: 'Completed', value: `${completedAll}`, color: colors.success, bar: colors.success, bg: colors.successLight },
              { label: 'Overdue', value: `${overdueAll}`, color: colors.danger, bar: colors.danger, bg: colors.dangerLight },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, screen.shadow, { backgroundColor: item.bg }]}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
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

          <View style={[styles.filterCard, screen.card]}>
            <Text style={styles.filterLabel}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {statusPills.map((pill) => (
                <TouchableOpacity
                  key={pill.key}
                  style={[styles.pill, pill.active && { backgroundColor: palette.dot, borderColor: palette.dot }]}
                  onPress={pill.onPress}
                >
                  <Text style={[styles.pillText, pill.active && styles.pillTextActive]}>{pill.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, styles.filterLabelSpacing]}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {priorityPills.map((pill) => (
                <TouchableOpacity
                  key={pill.key}
                  style={[styles.pill, pill.active && { backgroundColor: colors.text, borderColor: colors.text }]}
                  onPress={pill.onPress}
                >
                  <Text style={[styles.pillText, pill.active && styles.pillTextActive]}>{pill.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {tasks.length === 0 ? (
            <View style={[styles.emptyState, screen.card]}>
              <MaterialIcons name="playlist-add-check-circle" size={38} color={palette.dot} />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>Add a task or adjust your filters.</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === 'Completed';
              const overdue = task.is_overdue;
              const dueSoon = !overdue && !isDone && isDueSoon(task.deadline);
              const priority = priorityTone(task.priority);
              const status = statusTone(task.status);

              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    {
                      borderColor: overdue ? '#F4C7C5' : dueSoon ? '#F6D58D' : palette.border,
                      borderLeftColor: overdue ? colors.danger : dueSoon ? colors.warning : isDone ? colors.success : palette.dot,
                      backgroundColor: isDone ? colors.surfaceMuted : colors.surface,
                    },
                  ]}
                >
                  <TouchableOpacity style={[styles.checkCircle, isDone && { backgroundColor: colors.success, borderColor: colors.success }]} onPress={() => handleToggleComplete(task)}>
                    {isDone && <MaterialIcons name="check" size={12} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <View style={styles.taskBody}>
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                    {!!task.description && (
                      <Text style={[styles.taskDescription, isDone && styles.taskDescriptionDone]}>{task.description}</Text>
                    )}
                    <View style={styles.taskPillRow}>
                      <View style={[styles.taskPill, { backgroundColor: priority.bg }]}>
                        <Text style={[styles.taskPillText, { color: priority.text }]}>{task.priority}</Text>
                      </View>
                      {!isDone && (
                        <View style={[styles.taskPill, { backgroundColor: status.bg }]}>
                          <Text style={[styles.taskPillText, { color: status.text }]}>{task.status}</Text>
                        </View>
                      )}
                      {dueSoon && (
                        <View style={[styles.taskPill, { backgroundColor: colors.warningLight }]}>
                          <Text style={[styles.taskPillText, { color: colors.warning }]}>Due soon</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.deadlineText,
                      overdue && styles.deadlineOverdue,
                      dueSoon && styles.deadlineSoon,
                    ]}>
                      {overdue
                        ? `${formatDate(task.deadline)} | ${daysLate(task.deadline)}d late`
                        : `Due ${formatDate(task.deadline)}`}
                    </Text>
                  </View>

                  <View style={styles.taskActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => openEditTask(task)}>
                      <MaterialIcons name="edit" size={18} color={palette.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteTask(task.id)}>
                      <MaterialIcons name="delete-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={taskModalVisible} animationType="slide" transparent onRequestClose={resetTaskForm}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, screen.shadow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editTask ? 'Edit task' : 'New task'}</Text>
              <TouchableOpacity onPress={resetTaskForm}>
                <MaterialIcons name="close" size={22} color={colors.textHint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor={colors.textHint}
              value={formData.title}
              onChangeText={(value) => {
                setFormData((current) => ({ ...current, title: value }));
                if (error) {
                  setError('');
                }
              }}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task description"
              placeholderTextColor={colors.textHint}
              multiline
              value={formData.description}
              onChangeText={(value) => setFormData((current) => ({ ...current, description: value }))}
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.selectorRow}>
              {(['Low', 'Medium', 'High'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.selector, formData.priority === option && { backgroundColor: colors.text, borderColor: colors.text }]}
                  onPress={() => setFormData((current) => ({ ...current, priority: option }))}
                >
                  <Text style={[styles.selectorText, formData.priority === option && styles.selectorTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.selectorRow}>
              {(['Pending', 'In Progress', 'Completed'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.selector, formData.status === option && { backgroundColor: palette.dot, borderColor: palette.dot }]}
                  onPress={() => setFormData((current) => ({ ...current, status: option }))}
                >
                  <Text style={[styles.selectorText, formData.status === option && styles.selectorTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Deadline</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textHint}
              value={formData.deadline}
              onChangeText={(value) => setFormData((current) => ({ ...current, deadline: value }))}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetTaskForm}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleTaskSubmit} disabled={submitting}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Saving...' : editTask ? 'Save changes' : 'Create task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={projectModalVisible} animationType="slide" transparent onRequestClose={() => setProjectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, screen.shadow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit project</Text>
              <TouchableOpacity onPress={() => setProjectModalVisible(false)}>
                <MaterialIcons name="close" size={22} color={colors.textHint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Project name</Text>
            <TextInput
              style={styles.input}
              placeholder="Project name"
              placeholderTextColor={colors.textHint}
              value={projectForm.name}
              onChangeText={(value) => setProjectForm((current) => ({ ...current, name: value }))}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Project description"
              placeholderTextColor={colors.textHint}
              multiline
              value={projectForm.description}
              onChangeText={(value) => setProjectForm((current) => ({ ...current, description: value }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setProjectModalVisible(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleProjectSave} disabled={projectSubmitting}>
                <Text style={styles.primaryButtonText}>{projectSubmitting ? 'Saving...' : 'Save project'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 54,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    flex: 1,
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  heroDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.76)',
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  heroProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.24)',
    marginRight: 10,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  heroProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -34,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48.5%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
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
    fontSize: 28,
    fontWeight: '700',
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
  filterCard: {
    padding: 16,
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  filterLabelSpacing: {
    marginTop: 10,
  },
  pillRow: {
    paddingRight: 12,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textHint,
    textAlign: 'center',
  },
  taskCard: {
    borderWidth: 1.5,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  taskTitleDone: {
    color: colors.textHint,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  taskDescriptionDone: {
    color: colors.textHint,
  },
  taskPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  taskPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  taskPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deadlineText: {
    fontSize: 12,
    color: colors.textHint,
  },
  deadlineOverdue: {
    color: colors.danger,
    fontWeight: '700',
  },
  deadlineSoon: {
    color: colors.warning,
    fontWeight: '700',
  },
  taskActions: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  fieldLabel: {
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
    marginBottom: 14,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  selector: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
