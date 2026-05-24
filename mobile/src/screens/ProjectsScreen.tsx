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
import { colors, getProjectPalette, projectPalettes, screen } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

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
  is_overdue: boolean;
  project: number;
}

export default function ProjectsScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<number, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);

  const totalTasks = projects.reduce((sum, project) => sum + project.total_tasks, 0);
  const totalOverdue = projects.reduce((sum, project) => sum + project.overdue_tasks, 0);
  const avgCompletion = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + (project.completion_percentage ?? 0), 0) / projects.length)
    : 0;

  const filteredProjects = useMemo(() => (
    projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
    )
  ), [projects, search]);

  const fetchAll = async () => {
    try {
      const [projectRes, taskRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/tasks/'),
      ]);
      setProjects(projectRes.data);
      const grouped: Record<number, Task[]> = {};
      projectRes.data.forEach((project: Project) => {
        grouped[project.id] = taskRes.data.filter((task: Task) => task.project === project.id).slice(0, 4);
      });
      setTasksByProject(grouped);
    } catch (fetchError) {
      console.error('Failed to load projects', fetchError);
      setError(extractApiErrorMessage(fetchError, 'Failed to load projects.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedColor(0);
    setError('');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/projects/', { name, description, color: selectedColor });
      resetForm();
      setModalVisible(false);
      fetchAll();
    } catch (createError) {
      console.error('Failed to create project', createError);
      setError(extractApiErrorMessage(createError, 'Failed to create project.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Project', 'Delete this project and all its tasks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingProjectId(id);
          try {
            await api.delete(`/projects/${id}/`);
            setProjects((current) => current.filter((project) => project.id !== id));
            setTasksByProject((current) => {
              const next = { ...current };
              delete next[id];
              return next;
            });
            fetchAll();
          } catch (deleteError: any) {
            console.error('Failed to delete project', deleteError);
            if (deleteError?.response?.status === 404) {
              setProjects((current) => current.filter((project) => project.id !== id));
              setTasksByProject((current) => {
                const next = { ...current };
                delete next[id];
                return next;
              });
            } else {
              setError(extractApiErrorMessage(deleteError, 'Failed to delete project.'));
            }
          } finally {
            setDeletingProjectId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={screen.safe}>
      <ScrollView
        style={screen.body}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.teal} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Projects</Text>
              <Text style={styles.heroMeta}>
                {projects.length} project{projects.length !== 1 ? 's' : ''} | {totalTasks} tasks total
              </Text>
            </View>
            <TouchableOpacity style={styles.heroAction} onPress={() => { setModalVisible(true); setError(''); }}>
              <MaterialIcons name="add" size={18} color={colors.tealDeep} />
              <Text style={styles.heroActionText}>New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.74)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="rgba(255,255,255,0.68)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statGrid}>
            {[
              { label: 'Total Projects', value: `${projects.length}`, sub: 'created', color: colors.text, bar: colors.teal, bg: colors.surface },
              { label: 'Total Tasks', value: `${totalTasks}`, sub: 'across all projects', color: colors.text, bar: colors.teal, bg: colors.surface },
              { label: 'Avg. Completion', value: `${avgCompletion}%`, sub: 'across projects', color: colors.text, bar: colors.teal, bg: colors.surface },
              { label: 'Overdue', value: `${totalOverdue}`, sub: 'need attention', color: colors.danger, bar: colors.danger, bg: colors.dangerLight },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, screen.shadow, { backgroundColor: item.bg }]}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statSub}>{item.sub}</Text>
                <View style={[styles.statBar, { backgroundColor: item.bar }]} />
              </View>
            ))}
          </View>

          {!!search && (
            <View style={styles.searchMetaRow}>
              <Text style={styles.searchMetaText}>
                {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''} for "{search}"
              </Text>
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearSearch}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {!!error && (
            <View style={styles.errorCard}>
              <MaterialIcons name="warning-amber" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.teal} />
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={[styles.emptyState, screen.card]}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name={projects.length === 0 ? 'folder-open' : 'search-off'} size={26} color={colors.teal} />
              </View>
              <Text style={styles.emptyTitle}>{projects.length === 0 ? 'No projects yet' : 'No projects found'}</Text>
              <Text style={styles.emptyText}>
                {projects.length === 0 ? 'Tap New to create your first project.' : `No results for "${search}".`}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (projects.length === 0) {
                    setModalVisible(true);
                  } else {
                    setSearch('');
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>{projects.length === 0 ? 'Create Project' : 'Clear Search'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredProjects.map((project) => {
              const palette = getProjectPalette(project);
              const tasks = tasksByProject[project.id] ?? [];
              const pct = project.completion_percentage ?? 0;

              return (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: palette.border }]}
                  onPress={() => navigation.navigate('ProjectDetail', { id: project.id })}
                >
                  <View style={styles.projectHeader}>
                    <View style={styles.projectTitleRow}>
                      <View style={[styles.colorDot, { backgroundColor: palette.dot }]} />
                      <Text style={styles.projectTitle} numberOfLines={1}>{project.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(project.id)}>
                      <MaterialIcons
                        name={deletingProjectId === project.id ? 'hourglass-empty' : 'delete-outline'}
                        size={18}
                        color={deletingProjectId === project.id ? colors.textMuted : colors.textHint}
                      />
                    </TouchableOpacity>
                  </View>

                  {!!project.description && (
                    <Text style={styles.projectDescription}>{project.description}</Text>
                  )}

                  <View style={styles.progressMetaRow}>
                    <Text style={styles.projectMeta}>{project.completed_tasks}/{project.total_tasks} tasks</Text>
                    <Text style={[styles.progressPercent, { color: palette.dot }]}>{pct}%</Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: `${palette.dot}22` }]}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: palette.dot }]} />
                  </View>

                  <View style={styles.taskPreviewList}>
                    {tasks.length === 0 ? (
                      <Text style={styles.previewEmpty}>No tasks yet - tap to add.</Text>
                    ) : tasks.map((task) => (
                      <View key={task.id} style={styles.previewRow}>
                        <View style={[styles.previewBullet, task.status === 'Completed' && { backgroundColor: palette.dot, borderColor: palette.dot }]}>
                          {task.status === 'Completed' && <MaterialIcons name="check" size={9} color="#FFFFFF" />}
                        </View>
                        <Text style={[styles.previewTitle, task.status === 'Completed' && styles.previewTitleDone]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        {task.is_overdue && <MaterialIcons name="warning-amber" size={14} color={colors.danger} />}
                        {!task.is_overdue && task.priority === 'High' && task.status !== 'Completed' && (
                          <View style={styles.previewPill}>
                            <Text style={styles.previewPillText}>High</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>

                  <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: `${palette.dot}18`, borderColor: `${palette.dot}33` }]}>
                      <Text style={[styles.tagText, { color: palette.dot }]}>{project.total_tasks} tasks</Text>
                    </View>
                    {project.overdue_tasks > 0 && (
                      <View style={[styles.tag, styles.tagDanger]}>
                        <Text style={styles.tagDangerText}>{project.overdue_tasks} overdue</Text>
                      </View>
                    )}
                    {pct === 100 && (
                      <View style={[styles.tag, styles.tagSuccess]}>
                        <Text style={styles.tagSuccessText}>Complete</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, screen.shadow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create new project</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setError(''); }}>
                <MaterialIcons name="close" size={22} color={colors.textHint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Card color</Text>
            <View style={styles.colorRow}>
              {projectPalettes.map((palette, index) => (
                <TouchableOpacity
                  key={`${palette.dot}-${index}`}
                  style={[
                    styles.colorChoice,
                    { backgroundColor: index === 0 ? colors.surface : palette.dot, borderColor: selectedColor === index ? colors.text : palette.border },
                  ]}
                  onPress={() => setSelectedColor(index)}
                >
                  {index === 0 && <Text style={styles.colorChoiceLabel}>A</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.previewCard, { backgroundColor: projectPalettes[selectedColor].bg, borderColor: projectPalettes[selectedColor].border }]}>
              <View style={[styles.colorDot, { backgroundColor: projectPalettes[selectedColor].dot }]} />
              <Text style={[styles.previewCardText, { color: projectPalettes[selectedColor].text }]}>
                {name || 'Project name preview'}
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Project name</Text>
            <TextInput
              style={styles.input}
              placeholder="Website redesign"
              placeholderTextColor={colors.textHint}
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (error) {
                  setError('');
                }
              }}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Short description..."
              placeholderTextColor={colors.textHint}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {!!error && (
              <View style={styles.errorInline}>
                <Text style={styles.errorInlineText}>{error}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonModal} onPress={handleCreate} disabled={submitting}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Creating...' : 'Create project'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroMeta: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  heroAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: colors.tealDeep,
  },
  searchWrap: {
    marginTop: 16,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 13,
    zIndex: 1,
  },
  searchInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    color: '#FFFFFF',
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -34,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  searchMetaRow: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchMetaText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 10,
  },
  clearSearch: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal,
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
  loadingWrap: {
    paddingVertical: 48,
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
  primaryButtonModal: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  projectTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  projectDescription: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  progressMetaRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  taskPreviewList: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 12,
  },
  previewEmpty: {
    fontSize: 12,
    color: colors.textHint,
    fontStyle: 'italic',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  previewBullet: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  previewTitle: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  previewTitleDone: {
    color: colors.textHint,
    textDecorationLine: 'line-through',
  },
  previewPill: {
    borderRadius: 999,
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },
  previewPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.danger,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tagDanger: {
    backgroundColor: colors.dangerLight,
    borderColor: '#F4C7C5',
  },
  tagDangerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
  tagSuccess: {
    backgroundColor: colors.successLight,
    borderColor: '#B8E8D7',
  },
  tagSuccessText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
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
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorChoice: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  colorChoiceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textHint,
  },
  previewCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewCardText: {
    fontSize: 13,
    fontWeight: '600',
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
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorInline: {
    marginBottom: 12,
  },
  errorInlineText: {
    fontSize: 13,
    color: colors.danger,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
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
});
