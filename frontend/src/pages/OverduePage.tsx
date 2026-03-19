import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import api from '../api/axios'

interface Task {
  id: number; title: string; description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string; project: number; is_overdue: boolean
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: '#FEF0F0', color: '#A32D2D' }
  if (p === 'Medium') return { bg: '#FDF4E7', color: '#7A4A0A' }
  return { bg: '#E8F5F0', color: '#085041' }
}

const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

function OverduePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => { fetchOverdue() }, [])

  const fetchOverdue = async () => {
    try {
      const res = await api.get('/tasks/overdue/')
      setTasks(res.data.tasks ?? res.data)
    } catch { setError('Failed to load overdue tasks.') }
    finally { setLoading(false) }
  }

  const filtered = filterPriority ? tasks.filter(t => t.priority === filterPriority) : tasks
  const avgDays = tasks.length ? Math.round(tasks.reduce((s, t) => s + daysLate(t.deadline), 0) / tasks.length) : 0
  const highCount = tasks.filter(t => t.priority === 'High').length

  const pill = (active: boolean): React.CSSProperties => ({
    fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '20px',
    border: `1px solid ${active ? 'rgba(226,75,74,.3)' : '#E0DFD8'}`,
    background: active ? '#FEF0F0' : '#ffffff',
    color: active ? '#E24B4A' : '#8C8B85',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Topbar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#1C1C1A', lineHeight: 1 }}>Overdue Tasks</div>
          <div style={{ fontSize: '12px', color: '#8C8B85', marginTop: '2px' }}>Tasks that have passed their deadline</div>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5F0', border: '1.5px solid rgba(29,158,117,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#0F6E56' }}>AX</div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

        {/* Hero */}
        <div style={{ background: '#FEF0F0', border: '1px solid rgba(226,75,74,.12)', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: '#E24B4A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#E24B4A', margin: 0 }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} overdue
            </h1>
            <p style={{ fontSize: '13px', color: '#B03030', marginTop: '3px' }}>These tasks need to be resolved or rescheduled immediately.</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#E24B4A', lineHeight: 1 }}>{avgDays}</div>
              <div style={{ fontSize: '10px', color: '#B03030', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '3px', fontWeight: 500 }}>Avg days late</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#E24B4A', lineHeight: 1 }}>{highCount}</div>
              <div style={{ fontSize: '10px', color: '#B03030', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '3px', fontWeight: 500 }}>High priority</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', color: '#B8B7B0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Priority:</span>
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} style={pill((p === 'All' && !filterPriority) || filterPriority === p)} onClick={() => setFilterPriority(p === 'All' ? '' : p)}>
              {p}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div style={{ background: '#FEF0F0', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D' }}>{error}</div>}

        {loading && <div style={{ textAlign: 'center', padding: '48px', color: '#B8B7B0', fontSize: '13px' }}>Loading...</div>}

        {/* Empty */}
        {!loading && tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ width: '52px', height: '52px', background: '#E8F5F0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#1D9E75" />
            </div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '17px', color: '#1C1C1A', marginBottom: '6px' }}>No overdue tasks!</p>
            <p style={{ fontSize: '13px', color: '#B8B7B0' }}>You're all caught up. Great work!</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 90px 110px', padding: '10px 18px', background: '#F5F4EF', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {['Task', 'Project', 'Priority', 'Days late', 'Action'].map(h => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 500, color: '#B8B7B0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>

            {filtered.map((task, i) => (
              <div
                key={task.id}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 90px 90px 110px', padding: '14px 18px', borderBottom: i === filtered.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)', alignItems: 'center', cursor: 'pointer', transition: 'background .12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFAF8'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1A' }}>{task.title}</div>
                  <div style={{ fontSize: '11px', color: '#E24B4A', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <AlertTriangle size={10} /> {task.deadline}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#8C8B85' }}>Project #{task.project}</div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: priorityStyle(task.priority).bg, color: priorityStyle(task.priority).color }}>
                    {task.priority}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: '#FEF0F0', color: '#E24B4A' }}>
                    {daysLate(task.deadline)}d
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/projects/${task.project}`)}
                    style={{ background: 'transparent', border: '1px solid #E0DFD8', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 500, color: '#8C8B85', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
                  >
                    View <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default OverduePage