import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertTriangle, Check, Search } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number; name: string; description: string
  total_tasks: number; overdue_tasks: number
  completed_tasks: number; completion_percentage: number
}
interface Task {
  id: number; title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  is_overdue: boolean; project: number
}

const CARD_COLORS = [
  { bg: '#FFFDF5', border: '#F9E4A0', dot: '#F59E0B', text: '#7A4A0A', grad: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' },
  { bg: '#F4FAF5', border: '#A5D6A7', dot: '#1D9E75', text: '#085041', grad: 'linear-gradient(135deg, #1D9E75 0%, #085041 100%)' },
  { bg: '#F0F7FF', border: '#90CAF9', dot: '#378ADD', text: '#0C447C', grad: 'linear-gradient(135deg, #378ADD 0%, #185FA5 100%)' },
  { bg: '#FFF0F4', border: '#F48FB1', dot: '#E24B4A', text: '#A32D2D', grad: 'linear-gradient(135deg, #E24B4A 0%, #A32D2D 100%)' },
  { bg: '#F5F3FF', border: '#CE93D8', dot: '#7F77DD', text: '#3C3489', grad: 'linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)' },
  { bg: '#FFF5F2', border: '#FFAB91', dot: '#D85A30', text: '#712B13', grad: 'linear-gradient(135deg, #D85A30 0%, #993C1D 100%)' },
  { bg: '#F0FAFA', border: '#80DEEA', dot: '#0097A7', text: '#004D5C', grad: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)' },
  { bg: '#FBF5FF', border: '#CE93D8', dot: '#9C27B0', text: '#4A148C', grad: 'linear-gradient(135deg, #9C27B0 0%, #4A148C 100%)' },
]

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid #E0DFD8', borderRadius: '8px',
  backgroundColor: '#ffffff', color: '#1C1C1A', outline: 'none',
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
  const [search, setSearch] = useState('')

  const totalTasks = projects.reduce((s, p) => s + p.total_tasks, 0)
  const avgCompletion = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.completion_percentage ?? 0), 0) / projects.length)
    : 0
  const totalOverdue = projects.reduce((s, p) => s + p.overdue_tasks, 0)

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

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
        grouped[p.id] = taskRes.data.filter((t: Task) => t.project === p.id).slice(0, 4)
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#fafaf8' }}>

      {/* Teal gradient topbar */}
      <div style={{ background: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)', padding: '24px 32px 52px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
              Projects
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '6px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalTasks} tasks total
            </div>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 34px', fontSize: '13px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const }}
                onFocus={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
                onBlur={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => { setShowForm(!showForm); setError('') }}
              style={{ backgroundColor: '#fff', color: '#00696F', border: 'none', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}
            >
              {showForm ? <>✕ Cancel</> : <><Plus size={13} /> New Project</>}
            </button>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
              AX
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', marginTop: '-32px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Projects', value: projects.length, sub: 'created', color: '#1C1C1A', bar: '#0097A7', bg: '#fff' },
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', color: '#1C1C1A', bar: '#0097A7', bg: '#fff' },
            { label: 'Avg. Completion', value: `${avgCompletion}%`, sub: 'across projects', color: '#1C1C1A', bar: '#0097A7', bg: '#fff' },
            { label: 'Overdue', value: totalOverdue, sub: 'need attention', color: '#A32D2D', bar: '#E24B4A', bg: '#FEF0F0' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(0,0,0,0.07)', borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#B8B7B0', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Search result count */}
        {search && (
          <div style={{ fontSize: '13px', color: '#8C8B85', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={13} />
            {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"
            <button onClick={() => setSearch('')} style={{ marginLeft: '8px', fontSize: '11px', color: '#0097A7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
              Clear
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF0F0', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div style={{ background: '#ffffff', border: '1px solid #80DEEA', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,151,167,0.1)', marginBottom: '24px' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#1C1C1A', marginBottom: '18px' }}>
              Create new project
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#B8B7B0', display: 'block', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project name *</label>
                <input type="text" placeholder="e.g. Website Redesign" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inp} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#B8B7B0', display: 'block', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                <input type="text" placeholder="Short description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCreate} style={{ backgroundColor: '#0097A7', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Create project
              </button>
              <button onClick={() => { setShowForm(false); setError('') }} style={{ backgroundColor: 'transparent', color: '#8C8B85', border: '1px solid #E0DFD8', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading...</div>}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ width: '52px', height: '52px', background: '#E0F7FA', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px' }}>📋</div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#1C1C1A', marginBottom: '6px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: '#B8B7B0', marginBottom: '20px' }}>Click "New Project" to get started</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#0097A7', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ New Project</button>
          </div>
        )}

        {/* No search results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <Search size={32} color="#D3D1C7" style={{ marginBottom: '12px' }} />
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: '#1C1C1A', marginBottom: '6px' }}>No projects found</p>
            <p style={{ fontSize: '13px', color: '#B8B7B0', marginBottom: '16px' }}>No results for "{search}"</p>
            <button onClick={() => setSearch('')} style={{ background: '#0097A7', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Clear search</button>
          </div>
        )}

        {/* Project cards */}
        {!loading && filteredProjects.length > 0 && (
          <div style={{ columns: '2', columnGap: '16px' }}>
            {filteredProjects.map((project) => {
              // ── Use project.id for consistent color across all pages ──
              const c = CARD_COLORS[project.id % CARD_COLORS.length]
              const tasks = tasksByProject[project.id] ?? []
              const pct = project.completion_percentage ?? 0
              const completedCount = project.completed_tasks ?? 0

              return (
                <div
                  key={project.id}
                  style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', breakInside: 'avoid', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 24px ${c.dot}33` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
                >
                  <div style={{ padding: '16px 18px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Serif Display', serif" }}>
                          {project.name}
                        </span>
                      </div>
                      <button
                        onClick={e => handleDelete(project.id, e)}
                        style={{ background: 'none', border: 'none', color: `${c.dot}88`, cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0, marginLeft: '8px' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = c.dot}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = `${c.dot}88`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {project.description && (
                      <div style={{ fontSize: '12px', color: `${c.text}99`, marginBottom: '12px', lineHeight: 1.5 }}>{project.description}</div>
                    )}
                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: `${c.text}88`, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{completedCount}/{project.total_tasks} tasks</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: c.dot }}>{pct}%</span>
                    </div>
                    <div style={{ height: '5px', background: `${c.dot}22`, borderRadius: '20px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '20px', width: `${pct}%`, backgroundColor: c.dot, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  <div style={{ height: '1px', background: `${c.dot}22`, margin: '0 18px' }} />

                  <div style={{ padding: '10px 18px 14px' }}>
                    {tasks.length === 0 ? (
                      <div style={{ fontSize: '12px', color: `${c.text}66`, fontStyle: 'italic', padding: '4px 0' }}>No tasks yet — click to add</div>
                    ) : tasks.map((task, ti) => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: ti < tasks.length - 1 ? `1px solid ${c.dot}15` : 'none' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0, border: task.status === 'Completed' ? 'none' : `1.5px solid ${c.dot}66`, background: task.status === 'Completed' ? c.dot : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {task.status === 'Completed' && <Check size={8} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ flex: 1, fontSize: '12px', color: task.status === 'Completed' ? `${c.text}55` : c.text, textDecoration: task.status === 'Completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                        {task.is_overdue && <AlertTriangle size={11} color="#E24B4A" />}
                        {!task.is_overdue && task.priority === 'High' && task.status !== 'Completed' && (
                          <span style={{ fontSize: '9px', fontWeight: 600, padding: '1px 6px', borderRadius: '20px', background: '#FEF0F0', color: '#A32D2D', whiteSpace: 'nowrap' }}>High</span>
                        )}
                      </div>
                    ))}
                    {project.total_tasks > 4 && (
                      <div style={{ fontSize: '11px', color: `${c.text}66`, marginTop: '8px', fontStyle: 'italic' }}>+{project.total_tasks - 4} more tasks</div>
                    )}
                  </div>

                  <div style={{ padding: '8px 18px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px', background: `${c.dot}18`, color: c.dot, border: `1px solid ${c.dot}33` }}>{project.total_tasks} tasks</span>
                    {project.overdue_tasks > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px', background: '#FEF0F0', color: '#A32D2D', border: '1px solid #F7C1C1' }}>{project.overdue_tasks} overdue</span>
                    )}
                    {pct === 100 && (
                      <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px', background: '#E8F5F0', color: '#085041', border: '1px solid #9FE1CB' }}>✓ Complete</span>
                    )}
                  </div>
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