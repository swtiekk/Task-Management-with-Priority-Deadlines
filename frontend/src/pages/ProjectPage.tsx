import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertTriangle, Check, Search, X } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number; name: string; description: string; color: number
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
  { bg: '#ffffff', border: '#E0DFD8', dot: '#B8B7B0', text: '#5F5E5A' },
  { bg: '#FFFDF5', border: '#F9E4A0', dot: '#F59E0B', text: '#7A4A0A' },
  { bg: '#F4FAF5', border: '#A5D6A7', dot: '#1D9E75', text: '#085041' },
  { bg: '#F0F7FF', border: '#90CAF9', dot: '#378ADD', text: '#0C447C' },
  { bg: '#FFF0F4', border: '#F48FB1', dot: '#E24B4A', text: '#A32D2D' },
  { bg: '#F5F3FF', border: '#CE93D8', dot: '#7F77DD', text: '#3C3489' },
  { bg: '#FFF5F2', border: '#FFAB91', dot: '#D85A30', text: '#712B13' },
  { bg: '#F0FAFA', border: '#80DEEA', dot: '#0097A7', text: '#004D5C' },
  { bg: '#FBF5FF', border: '#CE93D8', dot: '#9C27B0', text: '#4A148C' },
]

const getColor = (project: Project) => {
  const colorIndex = (project.color && project.color > 0)
    ? project.color % CARD_COLORS.length
    : (project.id % (CARD_COLORS.length - 1)) + 1
  return CARD_COLORS[colorIndex]
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', fontSize: '13px',
  border: '1.5px solid var(--border-soft)', borderRadius: '8px',
  backgroundColor: 'var(--surface)', color: 'var(--text-primary)', outline: 'none',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color .15s',
}

function ProjectPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasksByProject, setTasksByProject] = useState<Record<number, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [submitting, setSubmitting] = useState(false)

  const totalTasks = projects.reduce((s, p) => s + p.total_tasks, 0)
  const avgCompletion = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.completion_percentage ?? 0), 0) / projects.length) : 0
  const totalOverdue = projects.reduce((s, p) => s + p.overdue_tasks, 0)
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => { fetchAll() }, [])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type); setTimeout(() => setToast(''), 3000)
  }

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([api.get('/projects/'), api.get('/tasks/')])
      setProjects(projRes.data)
      const grouped: Record<number, Task[]> = {}
      projRes.data.forEach((p: Project) => {
        grouped[p.id] = taskRes.data.filter((t: Task) => t.project === p.id).slice(0, 4)
      })
      setTasksByProject(grouped)
    } catch { showToast('Failed to load projects.', 'error') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) { setError('Project name is required.'); return }
    setSubmitting(true)
    try {
      await api.post('/projects/', { ...formData, color: selectedColor })
      setFormData({ name: '', description: '' }); setSelectedColor(0)
      setShowForm(false); setError(''); fetchAll()
      showToast('Project created successfully!')
    } catch { showToast('Failed to create project.', 'error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return
    try {
      await api.delete(`/projects/${id}/`); fetchAll(); showToast('Project deleted.')
    } catch { showToast('Failed to delete project.', 'error') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", backgroundColor: 'var(--bg)' }}>

      {/* Toast */}
      {toast && (
        <div role="alert" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: toastType === 'success' ? 'var(--text-primary)' : 'var(--danger)', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toastType === 'success' ? '✓' : '✕'} {toast}
        </div>
      )}

      {/* Teal topbar — always colorful */}
      <div style={{ background: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)', padding: '28px 32px 56px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', fontWeight: 400, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>Projects</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '6px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalTasks} tasks total
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '280px', minWidth: '160px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }} />
            <input type="search" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', fontSize: '13px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const }}
              onFocus={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.background = 'rgba(255,255,255,0.15)'} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => { setShowForm(!showForm); setError('') }}
              style={{ backgroundColor: '#fff', color: '#00696F', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}>
              {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> New Project</>}
            </button>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff' }}>AX</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', marginTop: '-36px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Projects', value: projects.length, sub: 'created', color: 'var(--text-primary)', bar: '#0097A7', bg: 'var(--surface)' },
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', color: 'var(--text-primary)', bar: '#0097A7', bg: 'var(--surface)' },
            { label: 'Avg. Completion', value: `${avgCompletion}%`, sub: 'across projects', color: 'var(--text-primary)', bar: '#0097A7', bg: 'var(--surface)' },
            { label: 'Overdue', value: totalOverdue, sub: 'need attention', color: 'var(--danger)', bar: 'var(--danger)', bg: 'var(--danger-light)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Search result count */}
        {search && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={13} />
            <span>{filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"</span>
            <button onClick={() => setSearch('')} style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--info)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Clear</button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--info-light)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(0,151,167,0.12)', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: '20px', fontWeight: 400 }}>
              Create new project
            </h2>

            {/* Color picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', display: 'block' }}>
                Card color <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {CARD_COLORS.map((col, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: i === 0 ? 'var(--surface)' : col.dot, border: `2.5px solid ${selectedColor === i ? 'var(--text-primary)' : i === 0 ? 'var(--border-soft)' : col.dot}`, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i === 0 && <span style={{ fontSize: '10px', color: 'var(--text-hint)', fontWeight: 700 }}>A</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: CARD_COLORS[selectedColor].bg, border: `1.5px solid ${CARD_COLORS[selectedColor].border}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CARD_COLORS[selectedColor].dot }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: CARD_COLORS[selectedColor].text }}>
                {formData.name || 'Project name preview'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Project name *</label>
                <input type="text" placeholder="e.g. Website Redesign" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); if (error) setError('') }} style={{ ...inp, borderColor: error && !formData.name.trim() ? 'var(--danger)' : 'var(--border-soft)' }} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                <input type="text" placeholder="Short description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCreate} disabled={submitting} style={{ backgroundColor: submitting ? 'var(--text-hint)' : '#0097A7', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {submitting ? 'Creating...' : 'Create project'}
              </button>
              <button onClick={() => { setShowForm(false); setError('') }} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border-soft)', borderRadius: '8px', padding: '10px 22px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-hint)', fontSize: '13px' }}>Loading projects...</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--info-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '26px' }}>📋</div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '20px' }}>Click "New Project" to get started</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#0097A7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              + New Project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Search size={36} color="var(--border-soft)" style={{ marginBottom: '14px' }} />
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>No projects found</p>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '16px' }}>No results for "{search}"</p>
            <button onClick={() => setSearch('')} style={{ background: '#0097A7', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Clear search</button>
          </div>
        )}

        {/* Project cards */}
        {!loading && filteredProjects.length > 0 && (
          <div style={{ columns: '2', columnGap: '16px' }}>
            {filteredProjects.map((project) => {
              const c = getColor(project)
              const tasks = tasksByProject[project.id] ?? []
              const pct = project.completion_percentage ?? 0
              const completedCount = project.completed_tasks ?? 0

              return (
                <div key={project.id}
                  style={{ background: 'var(--surface)', border: `1.5px solid ${c.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', breakInside: 'avoid', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 24px ${c.dot}33` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
                >
                  <div style={{ padding: '16px 18px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Serif Display', serif" }}>
                          {project.name}
                        </span>
                      </div>
                      <button onClick={e => handleDelete(project.id, e)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '4px', display: 'flex', flexShrink: 0, marginLeft: '8px', borderRadius: '6px' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = c.dot; (e.currentTarget as HTMLButtonElement).style.background = `${c.dot}15` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-hint)'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {project.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>{project.description}</div>
                    )}

                    <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-hint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {completedCount}/{project.total_tasks} tasks
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.dot }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: `${c.dot}22`, borderRadius: '20px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '20px', width: `${pct}%`, backgroundColor: c.dot, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border)', margin: '0 18px' }} />

                  <div style={{ padding: '10px 18px 14px' }}>
                    {tasks.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-hint)', fontStyle: 'italic', padding: '4px 0' }}>No tasks yet — click to add</div>
                    ) : tasks.map((task, ti) => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: ti < tasks.length - 1 ? `1px solid ${c.dot}15` : 'none' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0, border: task.status === 'Completed' ? 'none' : `1.5px solid ${c.dot}66`, background: task.status === 'Completed' ? c.dot : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {task.status === 'Completed' && <Check size={8} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ flex: 1, fontSize: '12px', color: task.status === 'Completed' ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                        {task.is_overdue && <AlertTriangle size={11} color="var(--danger)" />}
                        {!task.is_overdue && task.priority === 'High' && task.status !== 'Completed' && (
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', background: 'var(--danger-light)', color: 'var(--danger)', whiteSpace: 'nowrap' }}>High</span>
                        )}
                      </div>
                    ))}
                    {project.total_tasks > 4 && (
                      <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '8px', fontStyle: 'italic' }}>+{project.total_tasks - 4} more tasks</div>
                    )}
                  </div>

                  <div style={{ padding: '8px 18px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: `${c.dot}18`, color: c.dot, border: `1px solid ${c.dot}33` }}>{project.total_tasks} tasks</span>
                    {project.overdue_tasks > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #F7C1C1' }}>{project.overdue_tasks} overdue</span>
                    )}
                    {pct === 100 && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #9FE1CB' }}>✓ Complete</span>
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