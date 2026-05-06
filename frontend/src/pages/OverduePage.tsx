import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import api from '../api/axios'

interface Task {
  id: number; title: string; description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; project: number; is_overdue: boolean
}

interface Project {
  id: number; name: string
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: 'var(--danger-light)', color: 'var(--danger)' }
  if (p === 'Medium') return { bg: 'var(--warning-light)', color: '#7A4A0A' }
  return { bg: 'var(--accent-light)', color: '#085041' }
}

const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

function OverduePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [overdueRes, projectsRes] = await Promise.all([
        api.get('/tasks/overdue/'),
        api.get('/projects/')
      ])
      setTasks(overdueRes.data.tasks ?? overdueRes.data)
      setProjects(projectsRes.data)
    } catch { setError('Failed to load overdue tasks.') }
    finally { setLoading(false) }
  }

  const getProjectName = (id: number) => {
    const project = projects.find(p => p.id === id)
    return project ? project.name : `Project #${id}`
  }

  const filtered = filterPriority ? tasks.filter(t => t.priority === filterPriority) : tasks
  const avgDays = tasks.length
    ? Math.round(tasks.reduce((s, t) => s + daysLate(t.deadline), 0) / tasks.length)
    : 0
  const highCount = tasks.filter(t => t.priority === 'High').length
  const medCount = tasks.filter(t => t.priority === 'Medium').length

  const pill = (active: boolean): React.CSSProperties => ({
    fontSize: '12px', fontWeight: 500, padding: '6px 16px', borderRadius: '20px',
    border: `1px solid ${active ? 'rgba(226,75,74,.4)' : 'rgba(255,255,255,0.3)'}`,
    background: active ? '#fff' : 'rgba(255,255,255,0.12)',
    color: active ? 'var(--danger)' : 'rgba(255,255,255,0.8)',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .15s',
  })

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: 'var(--bg)',
    }}>

      {/* Red topbar */}
      <div style={{
        background: 'linear-gradient(135deg, #E24B4A 0%, #A32D2D 100%)',
        padding: '24px 32px 52px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#fff" />
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', fontWeight: 400, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
                Overdue Tasks
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
              Tasks that have passed their deadline
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
            AX
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
            Priority:
          </span>
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} style={pill((p === 'All' && !filterPriority) || filterPriority === p)}
              onClick={() => setFilterPriority(p === 'All' ? '' : p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 32px 32px', marginTop: '-28px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Overdue', value: tasks.length, sub: 'tasks past deadline', color: 'var(--danger)', bar: 'var(--danger)', bg: 'var(--danger-light)' },
            { label: 'Avg Days Late', value: avgDays, sub: 'days behind schedule', color: 'var(--warning)', bar: 'var(--warning)', bg: 'var(--warning-light)' },
            { label: 'High Priority', value: highCount, sub: `+ ${medCount} medium priority`, color: 'var(--danger)', bar: 'var(--danger)', bg: 'var(--surface)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px 20px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: s.bar }} />
              <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-hint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'var(--danger)', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-hint)', fontSize: '13px' }}>
            Loading...
          </div>
        )}

        {/* Empty state */}
        {!loading && tasks.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '72px 24px',
            background: 'var(--surface)', borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--accent-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={26} color="var(--accent)" />
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No overdue tasks!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '20px' }}>
              You're all caught up. Great work!
            </p>
            <button onClick={() => navigate('/')} style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '9px 20px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Back to Overview
            </button>
          </div>
        )}

        {/* Task table */}
        {!loading && filtered.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 100px 120px', padding: '12px 20px', background: 'var(--danger-light)', borderBottom: '1px solid rgba(226,75,74,.1)' }}>
              {['Task', 'Project', 'Priority', 'Days Late', 'Action'].map(h => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.map((task, i) => {
              const days = daysLate(task.deadline)
              const urgency = days > 14 ? '#A32D2D' : days > 7 ? '#E24B4A' : '#EF9F27'
              return (
                <div key={task.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 100px 100px 120px',
                  padding: '14px 20px',
                  borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
                  alignItems: 'center', transition: 'background .12s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                >
                  {/* Task info */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={10} /> Due {task.deadline}
                    </div>
                  </div>

                  {/* Project name */}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg2)', padding: '3px 9px', borderRadius: '20px', border: '1px solid var(--border-soft)' }}>
                      {getProjectName(task.project)}
                    </span>
                  </div>

                  {/* Priority badge */}
                  <div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '4px 10px',
                      borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
                      backgroundColor: priorityStyle(task.priority).bg,
                      color: priorityStyle(task.priority).color,
                    }}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Days late */}
                  <div>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, padding: '4px 10px',
                      borderRadius: '20px', background: `${urgency}18`,
                      color: urgency, border: `1px solid ${urgency}33`,
                    }}>
                      {days}d late
                    </span>
                  </div>

                  {/* Action */}
                  <div>
                    <button
                      onClick={() => navigate(`/projects/${task.project}`)}
                      style={{
                        background: 'transparent', border: '1px solid var(--border-soft)',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                        fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                        transition: 'all .12s',
                      }}
                      onMouseEnter={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.background = 'var(--danger)'
                        b.style.color = '#fff'
                        b.style.borderColor = 'var(--danger)'
                      }}
                      onMouseLeave={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.background = 'transparent'
                        b.style.color = 'var(--text-muted)'
                        b.style.borderColor = 'var(--border-soft)'
                      }}
                    >
                      View <ArrowRight size={11} />
                    </button>
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

export default OverduePage