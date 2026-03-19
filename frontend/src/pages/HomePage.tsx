import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, Folder, ArrowRight } from 'lucide-react'
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
  deadline: string; is_overdue: boolean; project: number
}

const CARD_COLORS = [
  { bg: '#FFF8E1', border: '#F9E4A0', dot: '#F59E0B', text: '#7A4A0A' },
  { bg: '#E8F5E9', border: '#A5D6A7', dot: '#1D9E75', text: '#085041' },
  { bg: '#E3F2FD', border: '#90CAF9', dot: '#378ADD', text: '#0C447C' },
  { bg: '#FCE4EC', border: '#F48FB1', dot: '#E24B4A', text: '#A32D2D' },
  { bg: '#EDE7F6', border: '#CE93D8', dot: '#7F77DD', text: '#3C3489' },
  { bg: '#FBE9E7', border: '#FFAB91', dot: '#D85A30', text: '#712B13' },
]

const priorityBadge = (p: string): React.CSSProperties => {
  if (p === 'High') return { background: '#FEF0F0', color: '#A32D2D' }
  if (p === 'Medium') return { background: '#FDF4E7', color: '#7A4A0A' }
  return { background: '#E8F5F0', color: '#085041' }
}

function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#fafaf8' }}>

      {/* Green topbar */}
      <div style={{
        background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)',
        padding: '24px 32px 52px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '4px', fontStyle: 'italic', fontFamily: "'DM Serif Display', serif" }}>
              {greeting} —
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
              Overview
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalTasks} tasks total
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
            AX
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', marginTop: '-32px' }}>

        {/* Stat cards overlapping header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', color: '#1C1C1A', bar: '#EF9F27', bg: '#fff' },
            { label: 'In Progress', value: totalInProgress, sub: 'active right now', color: '#185FA5', bar: '#378ADD', bg: '#EEF5FD' },
            { label: 'Completed', value: totalCompleted, sub: 'this month', color: '#085041', bar: '#1D9E75', bg: '#E8F5F0' },
            { label: 'Overdue', value: totalOverdue, sub: 'past deadline', color: '#A32D2D', bar: '#E24B4A', bg: '#FEF0F0' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '14px', padding: '18px 20px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: '#B8B7B0', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {totalOverdue > 0 && (
          <div style={{ background: '#FEF0F0', border: '1px solid rgba(226,75,74,.15)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', background: '#E24B4A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={16} color="#fff" />
            </div>
            <div>
              <strong style={{ fontSize: '13px', fontWeight: 600, color: '#A32D2D', display: 'block' }}>
                {totalOverdue} task{totalOverdue !== 1 ? 's' : ''} past their deadline
              </strong>
              <span style={{ fontSize: '11px', color: '#B03030' }}>Review and reschedule to keep projects on track.</span>
            </div>
            <button
              onClick={() => navigate('/overdue')}
              style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 500, color: '#A32D2D', background: '#fff', border: '1px solid rgba(226,75,74,.3)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              View overdue <ArrowRight size={12} />
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading...</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: '52px', height: '52px', background: '#E8F5F0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Folder size={24} color="#1D9E75" />
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#1C1C1A', marginBottom: '6px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: '#B8B7B0' }}>Go to All Projects to create your first project</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Recent Tasks */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8' }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '15px', color: '#1C1C1A' }}>Recent Tasks</span>
                <button
                  onClick={() => navigate('/projects')}
                  style={{ fontSize: '12px', color: '#1D9E75', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {recentTasks.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#B8B7B0', fontSize: '13px' }}>No tasks yet</div>
              ) : recentTasks.map((task, i) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/projects/${task.project}`)}
                  style={{ padding: '11px 20px', borderBottom: i < recentTasks.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAF8'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: task.status === 'Completed' ? 'none' : '1.5px solid #D8D7D0', background: task.status === 'Completed' ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.status === 'Completed' && <Check size={9} color="#fff" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: task.status === 'Completed' ? '#B8B7B0' : task.is_overdue ? '#A32D2D' : '#1C1C1A', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: task.is_overdue ? 500 : 400 }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#B8B7B0' }}>
                        {projects.find(p => p.id === task.project)?.name ?? '—'}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 500, padding: '1px 6px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', ...priorityBadge(task.priority) }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', flexShrink: 0, color: task.is_overdue ? '#E24B4A' : '#B8B7B0', fontWeight: task.is_overdue ? 600 : 400 }}>
                    {task.is_overdue ? '⚠ ' : ''}{task.deadline}
                  </span>
                </div>
              ))}
            </div>

            {/* Projects panel — Keep style */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8' }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '15px', color: '#1C1C1A' }}>Projects</span>
                <button
                  onClick={() => navigate('/projects')}
                  style={{ fontSize: '12px', color: '#1D9E75', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.map((project, i) => {
                  const c = CARD_COLORS[i % CARD_COLORS.length]
                  const pct = project.completion_percentage ?? 0
                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', transition: 'transform .12s, box-shadow .12s' }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.transform = 'translateY(-1px)'
                        el.style.boxShadow = `0 4px 12px ${c.dot}33`
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.transform = 'translateY(0)'
                        el.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c.dot }} />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: c.text }}>{project.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {project.overdue_tasks > 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', background: '#FEF0F0', color: '#A32D2D', border: '1px solid #F7C1C1' }}>
                              {project.overdue_tasks} late
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: `${c.text}88` }}>{project.total_tasks} tasks</span>
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