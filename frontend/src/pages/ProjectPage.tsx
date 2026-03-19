import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertTriangle, Check } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number; name: string; description: string
  total_tasks: number; overdue_tasks: number
}
interface Task {
  id: number; title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  is_overdue: boolean; project: number
}

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#888780', '#7F77DD', '#D85A30']

const statusBadge = (s: string): React.CSSProperties => {
  if (s === 'Completed') return { background: '#E8F5F0', color: '#085041' }
  if (s === 'In Progress') return { background: '#EEF5FD', color: '#185FA5' }
  return { background: '#F0EFEA', color: '#5F5E5A' }
}

const priorityBadge = (p: string): React.CSSProperties => {
  if (p === 'High') return { background: '#FEF0F0', color: '#A32D2D' }
  if (p === 'Medium') return { background: '#FDF4E7', color: '#7A4A0A' }
  return { background: '#E8F5F0', color: '#085041' }
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid #E0DFD8', borderRadius: '8px',
  backgroundColor: '#F5F4EF', color: '#1C1C1A', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}

function ProjectPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasksByProject, setTasksByProject] = useState<Record<number, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const totalTasks = projects.reduce((s, p) => s + p.total_tasks, 0)
  const avgCompletion = projects.length
    ? Math.round(projects.reduce((s, p) => {
        const pct = p.total_tasks > 0 ? ((p.total_tasks - p.overdue_tasks) / p.total_tasks) * 100 : 0
        return s + pct
      }, 0) / projects.length)
    : 0

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/tasks/'),
      ])
      setProjects(projRes.data)
      const grouped: Record<number, Task[]> = {}
      projRes.data.forEach((p: Project) => {
        grouped[p.id] = taskRes.data.filter((t: Task) => t.project === p.id).slice(0, 3)
      })
      setTasksByProject(grouped)
    } catch { setError('Failed to load.') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) { setError('Project name is required.'); return }
    try {
      await api.post('/projects/', formData)
      setFormData({ name: '', description: '' })
      setShowForm(false); setError(''); fetchAll()
    } catch { setError('Failed to create project.') }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its tasks?')) return
    try { await api.delete(`/projects/${id}/`); fetchAll() }
    catch { setError('Failed to delete project.') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#1C1C1A', lineHeight: 1 }}>Projects</div>
          <div style={{ fontSize: '12px', color: '#8C8B85', marginTop: '2px' }}>Manage and track all your projects</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Toggle create form button */}
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            style={{ backgroundColor: showForm ? '#F5F4EF' : '#1C1C1A', color: showForm ? '#1C1C1A' : '#fff', border: showForm ? '1px solid #E0DFD8' : 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}
          >
            {showForm ? (
              <>
                <span style={{ fontSize: '14px', lineHeight: 1 }}>×</span> Cancel
              </>
            ) : (
              <><Plus size={12} /> New Project</>
            )}
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5F0', border: '1.5px solid rgba(29,158,117,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#0F6E56' }}>AX</div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Projects', value: projects.length, sub: 'created', bar: '#E0DFD8' },
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', bar: '#EF9F27' },
            { label: 'Avg. Completion', value: `${avgCompletion}%`, sub: 'across projects', bar: '#1D9E75' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', color: '#1C1C1A', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#B8B7B0', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF0F0', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Create form — collapsible */}
        {showForm && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '22px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', fontWeight: 400, marginBottom: '16px', color: '#1C1C1A' }}>
              Create new project
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#B8B7B0', display: 'block', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project name *</label>
                <input
                  type="text" placeholder="e.g. Website Revamp"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inp}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#B8B7B0', display: 'block', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                <input
                  type="text" placeholder="Short description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={inp}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCreate}
                style={{ backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Create project
              </button>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                style={{ backgroundColor: 'transparent', color: '#8C8B85', border: '1px solid #E0DFD8', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading...</div>}

        {/* Project cards grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {projects.map((project, i) => {
              const pct = project.total_tasks > 0
                ? Math.round(((project.total_tasks - project.overdue_tasks) / project.total_tasks) * 100)
                : 0
              const tasks = tasksByProject[project.id] ?? []

              return (
                <div
                  key={project.id}
                  style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = COLORS[i % COLORS.length]}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.07)'}
                >
                  {/* Card header — this part navigates */}
                  <div
                    style={{ padding: '16px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1A' }}>{project.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#B8B7B0' }}>{project.total_tasks} tasks</span>
                        <button
                          onClick={e => handleDelete(project.id, e)}
                          style={{ background: 'none', border: 'none', color: '#D3D1C7', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '10px', color: '#B8B7B0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completion</span>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: '#1C1C1A' }}>{pct}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#EEEEE9', borderRadius: '2px' }}>
                      <div style={{ height: '4px', borderRadius: '2px', width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length], transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {tasks.length === 0 ? (
                    <div
                      style={{ padding: '18px', textAlign: 'center', color: '#B8B7B0', fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      No tasks yet — click to add
                    </div>
                  ) : tasks.map((task, ti) => (
                    <div
                      key={task.id}
                      style={{ padding: '10px 18px', borderBottom: ti < tasks.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      {/* Checkbox — display only, no navigation */}
                      <div
                        style={{ width: '15px', height: '15px', borderRadius: '3px', flexShrink: 0, border: task.status === 'Completed' ? 'none' : '1.5px solid #D8D7D0', background: task.status === 'Completed' ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}
                      >
                        {task.status === 'Completed' && <Check size={9} color="#fff" strokeWidth={3} />}
                      </div>

                      {/* Title — navigates to detail */}
                      <span
                        onClick={() => navigate(`/projects/${project.id}`)}
                        style={{ flex: 1, fontSize: '12px', color: task.status === 'Completed' ? '#B8B7B0' : '#1C1C1A', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                      >
                        {task.title}
                      </span>

                      {/* Badge */}
                      {task.status === 'Completed' ? (
                        <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...statusBadge('Completed') }}>Done</span>
                      ) : task.priority === 'High' ? (
                        <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...priorityBadge('High') }}>High</span>
                      ) : (
                        <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...statusBadge(task.status) }}>{task.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default ProjectPage