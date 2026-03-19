import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, Folder } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number; name: string; description: string
  total_tasks: number; overdue_tasks: number
}
interface Task {
  id: number; title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; is_overdue: boolean; project: number
}

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#E24B4A', '#7F77DD', '#D85A30']

const priorityBadge = (p: string): React.CSSProperties => {
  if (p === 'High') return { background: '#FEF0F0', color: '#A32D2D' }
  if (p === 'Medium') return { background: '#FDF4E7', color: '#7A4A0A' }
  return { background: '#E8F5F0', color: '#085041' }
}

const hov = (e: React.MouseEvent, bg: string) =>
  ((e.currentTarget as HTMLDivElement).style.background = bg)

function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const totalOverdue = projects.reduce((s, p) => s + p.overdue_tasks, 0)
  const totalTasks = projects.reduce((s, p) => s + p.total_tasks, 0)
  const totalCompleted = projects.reduce((s, p) => s + (p.total_tasks - p.overdue_tasks), 0)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/tasks/'),
      ])
      setProjects(projRes.data)
      setRecentTasks(taskRes.data.slice(0, 5))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Topbar */}
      <div style={{
        backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '13px', fontStyle: 'italic', color: '#8C8B85', lineHeight: 1, marginBottom: '2px' }}>
            Good morning —
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#1C1C1A', lineHeight: 1 }}>
            Overview
          </div>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5F0', border: '1.5px solid rgba(29,158,117,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#0F6E56' }}>
          AX
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '22px', overflowY: 'auto' }}>

        {/* Overdue alert */}
        {totalOverdue > 0 && (
          <div style={{ background: '#FEF0F0', border: '1px solid rgba(226,75,74,.12)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '32px', height: '32px', background: '#E24B4A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={15} color="#fff" />
            </div>
            <div>
              <strong style={{ fontSize: '13px', fontWeight: 500, color: '#E24B4A', display: 'block' }}>
                {totalOverdue} task{totalOverdue !== 1 ? 's' : ''} past their deadline
              </strong>
              <span style={{ fontSize: '11px', color: '#B03030' }}>Review and reschedule to keep your projects on track.</span>
            </div>
            <button
              onClick={() => navigate('/overdue')}
              style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 500, color: '#E24B4A', background: 'none', border: '1px solid rgba(226,75,74,.3)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
            >
              View overdue →
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Tasks', value: totalTasks, sub: 'across all projects', bar: '#EF9F27' },
            { label: 'In Progress', value: projects.reduce((s, p) => s + p.total_tasks, 0) - totalCompleted - totalOverdue, sub: 'active right now', bar: '#378ADD' },
            { label: 'Completed', value: totalCompleted, sub: 'this month', bar: '#1D9E75' },
            { label: 'Overdue', value: totalOverdue, sub: 'past deadline', bar: '#E24B4A' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '30px', color: '#1C1C1A', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#B8B7B0', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading...</div>}

        {/* Empty */}
        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: '48px', height: '48px', background: '#E8F5F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Folder size={22} color="#1D9E75" />
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '17px', color: '#1C1C1A', marginBottom: '6px' }}>No projects yet</p>
            <p style={{ fontSize: '13px', color: '#B8B7B0' }}>Go to All Tasks to create your first project</p>
          </div>
        )}

        {/* Two col: Recent Tasks + Projects */}
        {!loading && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Recent Tasks */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#8C8B85', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Recent tasks</span>
                <button style={{ fontSize: '11px', color: '#1D9E75', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => navigate('/projects')}>
                  View all →
                </button>
              </div>
              {recentTasks.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#B8B7B0', fontSize: '13px' }}>No tasks yet</div>
              ) : recentTasks.map(task => (
                <div
                  key={task.id}
                  style={{ padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  onMouseEnter={e => hov(e, '#FAFAF8')}
                  onMouseLeave={e => hov(e, 'transparent')}
                  onClick={() => navigate(`/projects/${task.project}`)}
                >
                  <div style={{ width: '17px', height: '17px', borderRadius: '50%', flexShrink: 0, border: task.status === 'Completed' ? 'none' : '1.5px solid #D8D7D0', background: task.status === 'Completed' ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.status === 'Completed' && <Check size={9} color="#fff" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: task.status === 'Completed' ? '#B8B7B0' : '#1C1C1A', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#B8B7B0' }}>{projects.find(p => p.id === task.project)?.name ?? '—'}</span>
                      <span style={{ fontSize: '9px', fontWeight: 500, padding: '2px 6px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', ...priorityBadge(task.priority) }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', flexShrink: 0, color: task.is_overdue ? '#E24B4A' : '#B8B7B0', fontWeight: task.is_overdue ? 500 : 400 }}>
                    {task.deadline}
                  </span>
                </div>
              ))}
            </div>

            {/* Projects panel */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#8C8B85', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Projects</span>
                <button style={{ fontSize: '11px', color: '#1D9E75', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => navigate('/projects')}>
                  View all →
                </button>
              </div>
              {projects.map((project, i) => {
                const pct = project.total_tasks > 0
                  ? Math.round(((project.total_tasks - project.overdue_tasks) / project.total_tasks) * 100)
                  : 0
                return (
                  <div
                    key={project.id}
                    style={{ padding: '13px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onMouseEnter={e => hov(e, '#FAFAF8')}
                    onMouseLeave={e => hov(e, 'transparent')}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#1C1C1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.name}
                      </div>
                      <div style={{ height: '3px', background: '#EEEEE9', borderRadius: '2px', marginTop: '5px' }}>
                        <div style={{ height: '3px', borderRadius: '2px', width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length], transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#8C8B85', fontWeight: 500, marginLeft: '8px', flexShrink: 0 }}>
                      {project.total_tasks}
                    </span>
                  </div>
                )
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default HomePage