import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, Folder, ArrowRight, TrendingUp } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number; name: string; description: string
  color: number
  total_tasks: number; overdue_tasks: number
  completed_tasks: number; completion_percentage: number
}
interface Task {
  id: number; title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; is_overdue: boolean; project: number
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

// Dark mode variants of project card colors
const CARD_COLORS_DARK = [
  { bg: '#1F2937', border: '#374151', dot: '#B8B7B0', text: '#9CA3AF' },
  { bg: '#2A2310', border: '#5C4A00', dot: '#F59E0B', text: '#FDE68A' },
  { bg: '#0F2820', border: '#1D5C40', dot: '#1D9E75', text: '#6EE7B7' },
  { bg: '#0C1E35', border: '#1E4A7A', dot: '#378ADD', text: '#93C5FD' },
  { bg: '#2D1010', border: '#7A1F1F', dot: '#E24B4A', text: '#FCA5A5' },
  { bg: '#1A1640', border: '#3D378A', dot: '#7F77DD', text: '#C4B5FD' },
  { bg: '#2A1508', border: '#7A3010', dot: '#D85A30', text: '#FDBA74' },
  { bg: '#082028', border: '#0E4D5C', dot: '#0097A7', text: '#67E8F9' },
  { bg: '#200A2A', border: '#5C1A70', dot: '#9C27B0', text: '#E879F9' },
]

const getColor = (project: Project, isDark: boolean) => {
  const colorIndex = (project.color && project.color > 0)
    ? project.color % CARD_COLORS.length
    : (project.id % (CARD_COLORS.length - 1)) + 1
  return isDark ? CARD_COLORS_DARK[colorIndex] : CARD_COLORS[colorIndex]
}

const priorityBadge = (p: string): React.CSSProperties => {
  if (p === 'High') return { background: 'var(--danger-light)', color: 'var(--danger)' }
  if (p === 'Medium') return { background: 'var(--warning-light)', color: '#7A4A0A' }
  return { background: 'var(--accent-light)', color: '#085041' }
}

function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const isDark = document.documentElement.classList.contains('dark')

  const totalOverdue = projects.reduce((s, p) => s + p.overdue_tasks, 0)
  const totalTasks = projects.reduce((s, p) => s + p.total_tasks, 0)
  const totalCompleted = projects.reduce((s, p) => s + (p.completed_tasks ?? 0), 0)
  const totalInProgress = recentTasks.filter(t => t.status === 'In Progress').length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/tasks/'),
      ])
      setProjects(projRes.data)
      setRecentTasks(taskRes.data.slice(0, 6))
    } catch { }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: 'var(--bg)',
    }}>

      {/* Teal topbar */}
      <div style={{
        background: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)',
        padding: '28px 32px 56px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontStyle: 'italic', fontFamily: "'DM Serif Display', serif" }}>
              {greeting} —
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', fontWeight: 400, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
              Overview
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={13} />
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalTasks} tasks total
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            AX
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', marginTop: '-36px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', color: 'var(--text-primary)', bar: '#0097A7', bg: 'var(--surface)' },
            { label: 'In Progress', value: totalInProgress, sub: 'active right now', color: 'var(--info)', bar: 'var(--info)', bg: 'var(--info-light)' },
            { label: 'Completed', value: totalCompleted, sub: 'this month', color: 'var(--success)', bar: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'Overdue', value: totalOverdue, sub: 'past deadline', color: 'var(--danger)', bar: 'var(--danger)', bg: 'var(--danger-light)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 20px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {totalOverdue > 0 && (
          <div role="alert" style={{
            background: 'var(--danger-light)', border: '1px solid rgba(226,75,74,.2)',
            borderRadius: '12px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px',
          }}>
            <div style={{ width: '38px', height: '38px', background: 'var(--danger)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} color="#fff" />
            </div>
            <div>
              <strong style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)', display: 'block' }}>
                {totalOverdue} task{totalOverdue !== 1 ? 's' : ''} past their deadline
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--danger)' }}>
                Review and reschedule to keep projects on track.
              </span>
            </div>
            <button onClick={() => navigate('/overdue')} style={{
              marginLeft: 'auto', fontSize: '12px', fontWeight: 600,
              color: 'var(--danger)', background: 'var(--surface)',
              border: '1px solid rgba(226,75,74,.3)', borderRadius: '8px',
              padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              View overdue <ArrowRight size={13} />
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-hint)', fontSize: '13px' }}>
            Loading your workspace...
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '64px',
            background: 'var(--surface)', borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--info-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Folder size={26} color="var(--info)" />
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No projects yet
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '20px' }}>
              Create your first project to get started
            </p>
            <button onClick={() => navigate('/projects')} style={{
              background: 'var(--info)', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '10px 24px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Create a Project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Recent Tasks */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: 'var(--text-primary)' }}>
                  Recent Tasks
                </span>
                <button onClick={() => navigate('/projects')} style={{
                  fontSize: '12px', color: 'var(--info)', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  View all <ArrowRight size={13} />
                </button>
              </div>

              {recentTasks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '13px' }}>
                  No tasks yet
                </div>
              ) : recentTasks.map((task, i) => (
                <div key={task.id} onClick={() => navigate(`/projects/${task.project}`)}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${task.project}`)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: i < recentTasks.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    border: task.status === 'Completed' ? 'none' : '1.5px solid var(--border-soft)',
                    background: task.status === 'Completed' ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {task.status === 'Completed' && <Check size={9} color="#fff" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      color: task.status === 'Completed' ? 'var(--text-hint)' : task.is_overdue ? 'var(--danger)' : 'var(--text-primary)',
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      fontWeight: task.is_overdue ? 500 : 400,
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-hint)' }}>
                        {projects.find(p => p.id === task.project)?.name ?? '—'}
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: 600, padding: '1px 7px',
                        borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        ...priorityBadge(task.priority),
                      }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px', flexShrink: 0,
                    color: task.is_overdue ? 'var(--danger)' : 'var(--text-hint)',
                    fontWeight: task.is_overdue ? 600 : 400,
                  }}>
                    {task.is_overdue ? '⚠ ' : ''}{task.deadline}
                  </span>
                </div>
              ))}
            </div>

            {/* Projects panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: 'var(--text-primary)' }}>
                  Projects
                </span>
                <button onClick={() => navigate('/projects')} style={{
                  fontSize: '12px', color: 'var(--info)', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  View all <ArrowRight size={13} />
                </button>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.map((project) => {
                  const c = getColor(project, isDark)
                  const pct = project.completion_percentage ?? 0
                  return (
                    <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                      role="button" tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
                      style={{
                        background: c.bg, border: `1.5px solid ${c.border}`,
                        borderRadius: '12px', padding: '12px 14px',
                        cursor: 'pointer', transition: 'transform .12s, box-shadow .12s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = `0 4px 12px ${c.dot}33` }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c.dot }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: c.text }}>{project.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {project.overdue_tasks > 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(226,75,74,0.2)' }}>
                              {project.overdue_tasks} late
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: c.text, opacity: 0.6 }}>{project.total_tasks} tasks</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '5px', background: `${c.dot}22`, borderRadius: '20px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '20px', width: `${pct}%`, backgroundColor: c.dot, transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: c.dot, flexShrink: 0 }}>{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage