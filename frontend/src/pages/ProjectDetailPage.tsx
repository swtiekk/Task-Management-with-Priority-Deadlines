import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, Pencil, Trash2, AlertCircle, AlertTriangle, Check, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'

interface Project { id: number; name: string; description: string }
interface Task {
  id: number; title: string; description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; is_overdue: boolean
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: '#FEF0F0', color: '#A32D2D' }
  if (p === 'Medium') return { bg: '#FDF4E7', color: '#7A4A0A' }
  return { bg: '#E8F5F0', color: '#085041' }
}
const statusStyle = (s: string) => {
  if (s === 'In Progress') return { bg: '#EEF5FD', color: '#185FA5' }
  return { bg: '#F0EFEA', color: '#5F5E5A' }
}

const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid #E0DFD8', borderRadius: '8px',
  backgroundColor: '#F5F4EF', color: '#1C1C1A', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  fontSize: '10px', color: '#B8B7B0', display: 'block',
  marginBottom: '6px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em',
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
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Low', status: 'Pending', deadline: ''
  })

  useEffect(() => { fetchProject(); fetchTasks() }, [id])
  useEffect(() => { fetchTasks() }, [filterStatus, filterPriority])

  const fetchProject = async () => {
    try { const res = await api.get(`/projects/${id}/`); setProject(res.data) }
    catch { setError('Project not found.') }
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

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'Low', status: 'Pending', deadline: '' })
    setEditTask(null); setShowForm(false); setError('')
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) { setError('Title is required.'); return }
    if (!formData.deadline) { setError('Deadline is required.'); return }
    try {
      if (editTask) await api.put(`/tasks/${editTask.id}/`, { ...formData, project: id })
      else await api.post('/tasks/', { ...formData, project: id })
      resetForm(); fetchTasks()
    } catch (err: any) {
      setError(err.response?.data?.deadline?.[0] || 'Failed to save task.')
    }
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setFormData({ title: task.title, description: task.description, priority: task.priority, status: task.status, deadline: task.deadline })
    setShowForm(true); setError('')
  }

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task?')) return
    try { await api.delete(`/tasks/${taskId}/`); fetchTasks() }
    catch { setError('Failed to delete task.') }
  }

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      await api.put(`/tasks/${task.id}/`, {
        title: task.title, description: task.description,
        priority: task.priority, deadline: task.deadline,
        status: newStatus, project: id,
      })
      fetchTasks()
    } catch { setError('Failed to update task.') }
  }

  const handleStatClick = (card: string, status: string) => {
    setActiveCard(card)
    setFilterStatus(status)
    setFilterPriority('')
  }

  // unfiltered task counts for stat cards
  const [allTasks, setAllTasks] = useState<Task[]>([])
  useEffect(() => {
    api.get('/tasks/', { params: { project: id } })
      .then(res => setAllTasks(res.data))
      .catch(() => {})
  }, [id, tasks])

  const totalAll = allTasks.length
  const completedAll = allTasks.filter(t => t.status === 'Completed').length
  const inProgressAll = allTasks.filter(t => t.status === 'In Progress').length
  const overdueAll = allTasks.filter(t => t.is_overdue).length

  const pill = (active: boolean, color = '#1D9E75'): React.CSSProperties => ({
    padding: '5px 13px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
    border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
    backgroundColor: active ? color : '#ffffff',
    color: active ? '#fff' : '#8C8B85',
    borderColor: active ? color : '#E0DFD8',
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/projects')}
            style={{ background: 'none', border: 'none', color: '#8C8B85', cursor: 'pointer', fontSize: '12px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            <ArrowLeft size={14} /> Projects
          </button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)' }} />
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#1C1C1A', lineHeight: 1 }}>
              {project?.name ?? '—'}
            </div>
            {project?.description && (
              <div style={{ fontSize: '11px', color: '#8C8B85', marginTop: '1px' }}>{project.description}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            style={{ backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}
          >
            <Plus size={12} /> Add Task
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5F0', border: '1.5px solid rgba(29,158,117,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#0F6E56' }}>AX</div>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' }}>
          {([
            { key: 'total', label: 'Total Tasks', value: totalAll, color: '#1C1C1A', bar: '#1D9E75', onClick: () => handleStatClick('total', '') },
            { key: 'pending', label: 'Pending', value: allTasks.filter(t => t.status === 'Pending').length, color: '#5F5E5A', bar: '#888780', onClick: () => handleStatClick('pending', 'Pending') },
            { key: 'prog', label: 'In Progress', value: inProgressAll, color: '#BA7517', bar: '#EF9F27', onClick: () => handleStatClick('prog', 'In Progress') },
            { key: 'done', label: 'Completed', value: completedAll, color: '#0F6E56', bar: '#1D9E75', onClick: () => handleStatClick('done', 'Completed') },
            { key: 'ov', label: 'Overdue', value: overdueAll, color: '#A32D2D', bar: '#E24B4A', onClick: () => navigate('/overdue') },
          ] as const).map(s => (
            <div key={s.key} onClick={s.onClick} style={{ background: '#ffffff', border: `1px solid ${activeCard === s.key ? s.bar : 'rgba(0,0,0,0.07)'}`, borderRadius: '12px', padding: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: s.color, lineHeight: 1 }}>{s.value}</div>
              {activeCard === s.key && s.key !== 'total' && s.key !== 'ov' && (
                <div style={{ fontSize: '10px', color: s.bar, marginTop: '3px', fontWeight: 500 }}>filtered</div>
              )}
              {s.key === 'ov' && <div style={{ fontSize: '10px', color: s.bar, marginTop: '3px', fontWeight: 500 }}>view all</div>}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF0F0', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Task form */}
        {showForm && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '22px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', fontWeight: 400, marginBottom: '18px', color: '#1C1C1A' }}>
              {editTask ? 'Edit task' : 'New task'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Title *</label>
                <input type="text" placeholder="Task title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inp} />
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
                <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSubmit} style={{ backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {editTask ? 'Save changes' : 'Create task'}
              </button>
              <button onClick={resetForm} style={{ backgroundColor: 'transparent', color: '#8C8B85', border: '1px solid #E0DFD8', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#B8B7B0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '2px' }}>Status</span>
          {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button key={f}
              onClick={() => { setFilterStatus(f === 'All' ? '' : f); setActiveCard('total') }}
              style={pill((f === 'All' && !filterStatus) || filterStatus === f)}>
              {f}
            </button>
          ))}
          <div style={{ width: '1px', height: '20px', background: '#E0DFD8', margin: '0 2px' }} />
          <span style={{ fontSize: '10px', color: '#B8B7B0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '2px' }}>Priority</span>
          {['All', 'Low', 'Medium', 'High'].map(p => (
            <button key={p}
              onClick={() => setFilterPriority(p === 'All' ? '' : p)}
              style={pill((p === 'All' && !filterPriority) || filterPriority === p, '#1C1C1A')}>
              {p}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading tasks...</div>}

        {!loading && tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <CheckCircle2 size={32} color="#D3D1C7" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '14px', color: '#B8B7B0' }}>No tasks found — click Add Task to get started</p>
          </div>
        )}

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map(task => {
            const isDone = task.status === 'Completed'
            const isOv = task.is_overdue
            return (
              <div key={task.id} style={{
                background: '#ffffff',
                border: `1px solid ${isOv ? '#F7C1C1' : 'rgba(0,0,0,0.07)'}`,
                borderLeft: `3px solid ${isOv ? '#E24B4A' : isDone ? '#1D9E75' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: isOv || isDone ? '0 12px 12px 0' : '12px',
                padding: '13px 15px',
                display: 'flex', alignItems: 'center', gap: '12px',
                opacity: isDone ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}>

                {/* Clickable circle */}
                <div
                  onClick={() => handleToggleComplete(task)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    border: isDone ? 'none' : '2px solid #D3D1C7',
                    backgroundColor: isDone ? '#1D9E75' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isDone) (e.currentTarget as HTMLDivElement).style.borderColor = '#1D9E75' }}
                  onMouseLeave={e => { if (!isDone) (e.currentTarget as HTMLDivElement).style.borderColor = '#D3D1C7' }}
                >
                  {isDone && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>

                {/* Task info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: isDone ? '#B8B7B0' : '#1C1C1A', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '11px', color: isDone ? '#C8C7C0' : '#8C8B85', marginTop: '2px' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {/* Priority — always show */}
                    <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '20px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: priorityStyle(task.priority).bg, color: priorityStyle(task.priority).color }}>
                      {task.priority}
                    </span>
                    {/* Status — only show if not completed */}
                    {!isDone && (
                      <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '20px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: statusStyle(task.status).bg, color: statusStyle(task.status).color }}>
                        {task.status}
                      </span>
                    )}
                    {/* Date */}
                    {isOv ? (
                      <span style={{ fontSize: '11px', color: '#A32D2D', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={10} />
                        {task.deadline} — {daysLate(task.deadline)} day{daysLate(task.deadline) !== 1 ? 's' : ''} late
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#B8B7B0' }}>{task.deadline}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(task)} style={{ background: 'transparent', border: '1px solid #E0DFD8', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', color: '#8C8B85', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ background: 'transparent', border: '1px solid #F7C1C1', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', color: '#A32D2D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
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