import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, Pencil, Trash2, AlertCircle, AlertTriangle, Check, CheckCircle2, Save, X } from 'lucide-react'
import api from '../api/axios'

interface Project { id: number; name: string; description: string; color: number }
interface Task {
  id: number; title: string; description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; is_overdue: boolean
}

const CARD_COLORS = [
  { bg: '#ffffff', border: '#E0DFD8', dot: '#B8B7B0', text: '#5F5E5A', grad: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)' },
  { bg: '#FFFDF5', border: '#F9E4A0', dot: '#F59E0B', text: '#7A4A0A', grad: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' },
  { bg: '#F4FAF5', border: '#A5D6A7', dot: '#1D9E75', text: '#085041', grad: 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)' },
  { bg: '#F0F7FF', border: '#90CAF9', dot: '#378ADD', text: '#0C447C', grad: 'linear-gradient(135deg, #378ADD 0%, #185FA5 100%)' },
  { bg: '#FFF0F4', border: '#F48FB1', dot: '#E24B4A', text: '#A32D2D', grad: 'linear-gradient(135deg, #E24B4A 0%, #A32D2D 100%)' },
  { bg: '#F5F3FF', border: '#CE93D8', dot: '#7F77DD', text: '#3C3489', grad: 'linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)' },
  { bg: '#FFF5F2', border: '#FFAB91', dot: '#D85A30', text: '#712B13', grad: 'linear-gradient(135deg, #D85A30 0%, #993C1D 100%)' },
  { bg: '#F0FAFA', border: '#80DEEA', dot: '#0097A7', text: '#004D5C', grad: 'linear-gradient(135deg, #0097A7 0%, #004D5C 100%)' },
  { bg: '#FBF5FF', border: '#CE93D8', dot: '#9C27B0', text: '#4A148C', grad: 'linear-gradient(135deg, #9C27B0 0%, #4A148C 100%)' },
]

const getColor = (project: Project | null) => {
  if (!project) return CARD_COLORS[1]
  const colorIndex = (project.color && project.color > 0)
    ? project.color % CARD_COLORS.length
    : (project.id % (CARD_COLORS.length - 1)) + 1
  return CARD_COLORS[colorIndex]
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: 'var(--danger-light)', color: 'var(--danger)' }
  if (p === 'Medium') return { bg: 'var(--warning-light)', color: '#7A4A0A' }
  return { bg: 'var(--accent-light)', color: '#085041' }
}

const statusStyle = (s: string) => {
  if (s === 'In Progress') return { bg: 'var(--info-light)', color: '#185FA5' }
  return { bg: 'var(--bg2)', color: 'var(--text-muted)' }
}

const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

const dueSoon = (deadline: string) => {
  const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000)
  return diff >= 0 && diff <= 3
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', fontSize: '13px',
  border: '1.5px solid var(--border-soft)', borderRadius: '8px',
  backgroundColor: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color .15s',
}

const lbl: React.CSSProperties = {
  fontSize: '11px', color: 'var(--text-muted)', display: 'block',
  marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
}

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [activeCard, setActiveCard] = useState('total')
  const [editingProject, setEditingProject] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [projectError, setProjectError] = useState('')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Low', status: 'Pending', deadline: ''
  })

  useEffect(() => { fetchProject(); fetchTasks() }, [id])
  useEffect(() => { fetchTasks() }, [filterStatus, filterPriority])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}/`)
      setProject(res.data)
      setProjectForm({ name: res.data.name, description: res.data.description })
    } catch { setError('Project not found.') }
  }

  const fetchTasks = async () => {
    try {
      const params: Record<string, string> = { project: id! }
      if (filterStatus) params.status = filterStatus
      if (filterPriority) params.priority = filterPriority
      const res = await api.get('/tasks/', { params })
      setTasks(res.data)
    } catch { setError('Failed to load tasks.') }
    finally { setLoading(false) }
  }

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) { setProjectError('Project name is required.'); return }
    try {
      const res = await api.patch(`/projects/${id}/`, projectForm)
      setProject(res.data); setEditingProject(false); setProjectError('')
      showToast('Project updated successfully!')
    } catch { setProjectError('Failed to update project.') }
  }

  const handleCancelProjectEdit = () => {
    setProjectForm({ name: project?.name ?? '', description: project?.description ?? '' })
    setEditingProject(false); setProjectError('')
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'Low', status: 'Pending', deadline: '' })
    setEditTask(null); setShowForm(false); setError('')
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setError('Title is required.'); return }
    if (!formData.deadline) { setError('Deadline is required.'); return }
    setSubmitting(true)
    try {
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}/`, formData)
        showToast('Task updated successfully!')
      } else {
        await api.post('/tasks/', { ...formData, project: id })
        showToast('Task added successfully!')
      }
      resetForm(); fetchTasks()
    } catch (err: any) {
      setError(err.response?.data?.deadline?.[0] || err.response?.data?.title?.[0] || 'Failed to save task.')
    } finally { setSubmitting(false) }
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setFormData({ title: task.title, description: task.description, priority: task.priority, status: task.status, deadline: task.deadline })
    setShowForm(true); setError('')
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      await api.delete(`/tasks/${taskId}/`)
      fetchTasks(); showToast('Task deleted.')
    } catch { showToast('Failed to delete task.', 'error') }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      await api.patch(`/tasks/${task.id}/`, { status: newStatus })
      fetchTasks()
      showToast(newStatus === 'Completed' ? 'Task marked as complete!' : 'Task reopened.')
    } catch { showToast('Failed to update task.', 'error') }
  }

  const handleStatClick = (card: string, status: string) => {
    setActiveCard(card); setFilterStatus(status); setFilterPriority('')
  }

  const [allTasks, setAllTasks] = useState<Task[]>([])
  useEffect(() => {
    api.get('/tasks/', { params: { project: id } })
      .then(res => setAllTasks(res.data)).catch(() => {})
  }, [id, tasks])

  const totalAll = allTasks.length
  const completedAll = allTasks.filter(t => t.status === 'Completed').length
  const inProgressAll = allTasks.filter(t => t.status === 'In Progress').length
  const overdueAll = allTasks.filter(t => t.is_overdue).length
  const pct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0
  const c = getColor(project)

  const pill = (active: boolean, color = c.dot): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
    backgroundColor: active ? color : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-muted)',
    borderColor: active ? color : 'var(--border-soft)',
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--bg)' }}>

      {/* Toast */}
      {toast && (
        <div role="alert" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toastType === 'success' ? 'var(--text-primary)' : 'var(--danger)', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toastType === 'success' ? '✓' : '✕'} {toast}
        </div>
      )}

      {/* Colored topbar — kept as-is, always colorful */}
      <div style={{ background: c.grad, padding: '20px 28px 52px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
            <button onClick={() => navigate('/projects')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', cursor: 'pointer', fontSize: '12px', padding: '7px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, flexShrink: 0, marginTop: '2px' }}>
              <ArrowLeft size={13} /> Projects
            </button>

            {editingProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                {projectError && <div style={{ fontSize: '11px', color: '#fca5a5' }}>{projectError}</div>}
                <input type="text" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Project name" style={{ ...inp, fontSize: '16px', fontWeight: 600, padding: '7px 12px' }} autoFocus />
                <input type="text" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Project description (optional)" style={{ ...inp, fontSize: '13px', padding: '6px 12px' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={handleSaveProject} style={{ background: '#fff', color: c.text, border: 'none', borderRadius: '7px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                    <Save size={11} /> Save
                  </button>
                  <button onClick={handleCancelProjectEdit} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '7px', padding: '7px 16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                    <X size={11} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: '#fff', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    {project?.name ?? '—'}
                  </h1>
                  <button onClick={() => setEditingProject(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '7px', padding: '5px 9px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Pencil size={11} />
                  </button>
                </div>
                {project?.description && (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>{project.description}</div>
                )}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.25)', borderRadius: '20px', overflow: 'hidden', maxWidth: '200px' }}>
                    <div style={{ height: '100%', borderRadius: '20px', width: `${pct}%`, background: '#fff', transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{pct}% complete</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => { setShowForm(!showForm); setError('') }} style={{ backgroundColor: '#fff', color: c.text, border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}>
              <Plus size={13} /> Add Task
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
              AX
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 28px 28px', marginTop: '-28px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {([
            { key: 'total', label: 'Total Tasks', value: totalAll, color: 'var(--text-primary)', bar: c.dot, bg: 'var(--surface)', onClick: () => handleStatClick('total', '') },
            { key: 'pending', label: 'Pending', value: allTasks.filter(t => t.status === 'Pending').length, color: 'var(--text-muted)', bar: 'var(--text-muted)', bg: 'var(--surface)', onClick: () => handleStatClick('pending', 'Pending') },
            { key: 'prog', label: 'In Progress', value: inProgressAll, color: 'var(--warning)', bar: 'var(--warning)', bg: 'var(--warning-light)', onClick: () => handleStatClick('prog', 'In Progress') },
            { key: 'done', label: 'Completed', value: completedAll, color: 'var(--success)', bar: 'var(--success)', bg: 'var(--success-light)', onClick: () => handleStatClick('done', 'Completed') },
            { key: 'ov', label: 'Overdue', value: overdueAll, color: 'var(--danger)', bar: 'var(--danger)', bg: 'var(--danger-light)', onClick: () => navigate('/overdue') },
          ] as const).map(s => (
            <button key={s.key} onClick={s.onClick} style={{ background: s.bg, border: `1.5px solid ${activeCard === s.key ? s.bar : 'var(--border)'}`, borderRadius: '14px', padding: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: s.color, lineHeight: 1 }}>{s.value}</div>
              {activeCard === s.key && s.key !== 'total' && s.key !== 'ov' && (
                <div style={{ fontSize: '10px', color: s.bar, marginTop: '3px', fontWeight: 600 }}>filtered ✓</div>
              )}
              {s.key === 'ov' && <div style={{ fontSize: '10px', color: s.bar, marginTop: '3px', fontWeight: 600 }}>view all →</div>}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" style={{ background: 'var(--danger-light)', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Task form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: `1.5px solid ${c.border}`, borderRadius: '14px', padding: '24px', marginBottom: '18px', boxShadow: `0 4px 24px ${c.dot}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.dot }} />
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
                {editTask ? 'Edit task' : 'New task'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Title *</label>
                <input type="text" placeholder="Task title" value={formData.title} onChange={e => { setFormData({ ...formData, title: e.target.value }); if (error) setError('') }} style={{ ...inp, borderColor: error && !formData.title.trim() ? 'var(--danger)' : 'var(--border-soft)' }} autoFocus />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Description</label>
                <textarea placeholder="Task description (optional)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={lbl}>Priority</label>
                <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={inp}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}>
                  <option>Pending</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Deadline *</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} style={{ ...inp, borderColor: error && !formData.deadline ? 'var(--danger)' : 'var(--border-soft)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmit} disabled={submitting} style={{ backgroundColor: submitting ? 'var(--text-hint)' : c.dot, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {submitting ? 'Saving...' : editTask ? 'Save changes' : 'Create task'}
              </button>
              <button onClick={resetForm} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border-soft)', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-hint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '2px' }}>Status</span>
          {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button key={f} onClick={() => { setFilterStatus(f === 'All' ? '' : f); setActiveCard('total') }} style={pill((f === 'All' && !filterStatus) || filterStatus === f)}>
              {f}
            </button>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'var(--border-soft)', margin: '0 4px' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-hint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '2px' }}>Priority</span>
          {['All', 'Low', 'Medium', 'High'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p === 'All' ? '' : p)} style={pill((p === 'All' && !filterPriority) || filterPriority === p, 'var(--text-primary)')}>
              {p}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-hint)', fontSize: '13px' }}>Loading tasks...</div>
        )}

        {!loading && tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: 'var(--surface)', borderRadius: '14px', border: `1.5px solid ${c.border}` }}>
            <CheckCircle2 size={36} color={c.dot} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-hint)' }}>No tasks found — click <strong>Add Task</strong> to get started</p>
          </div>
        )}

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map(task => {
            const isDone = task.status === 'Completed'
            const isOv = task.is_overdue
            const isSoon = !isOv && !isDone && dueSoon(task.deadline)

            return (
              <div key={task.id} style={{
                background: isDone ? 'var(--bg)' : 'var(--surface)',
                border: `1px solid ${isOv ? 'var(--danger-light)' : isSoon ? 'var(--warning-light)' : isDone ? 'var(--border)' : c.border}`,
                borderLeft: `4px solid ${isOv ? 'var(--danger)' : isSoon ? 'var(--warning)' : isDone ? 'var(--accent)' : c.dot}`,
                borderRadius: '0 12px 12px 0',
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                opacity: isDone ? 0.65 : 1, transition: 'all 0.15s',
              }}>
                <button onClick={() => handleToggleComplete(task)} style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: isDone ? 'none' : `2px solid ${c.dot}66`, backgroundColor: isDone ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {isDone && <Check size={11} color="#fff" strokeWidth={3} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: isDone ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '11px', color: isDone ? 'var(--text-hint)' : 'var(--text-muted)', marginTop: '2px', lineHeight: 1.5 }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: priorityStyle(task.priority).bg, color: priorityStyle(task.priority).color }}>
                      {task.priority}
                    </span>
                    {!isDone && (
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: statusStyle(task.status).bg, color: statusStyle(task.status).color }}>
                        {task.status}
                      </span>
                    )}
                    {isOv ? (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={10} /> {task.deadline} — {daysLate(task.deadline)}d late
                      </span>
                    ) : isSoon ? (
                      <span style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>
                        ⚡ Due soon — {task.deadline}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>Due {task.deadline}</span>
                    )}
                    {isSoon && (
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid #F9E4A0' }}>
                        Due soon
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(task)} style={{ background: 'transparent', border: `1.5px solid ${c.border}`, borderRadius: '7px', padding: '6px 12px', fontSize: '11px', color: c.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ background: 'transparent', border: '1.5px solid var(--danger-light)', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage