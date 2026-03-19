import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string
  project: number
}

interface Props {
  tasks: Task[]
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: '#FCEBEB', color: '#A32D2D' }
  if (p === 'Medium') return { bg: '#FAEEDA', color: '#633806' }
  return { bg: '#E1F5EE', color: '#085041' }
}

const statusStyle = (s: string) => {
  if (s === 'Completed') return { bg: '#E1F5EE', color: '#085041' }
  if (s === 'In Progress') return { bg: '#E6F1FB', color: '#185FA5' }
  return { bg: '#EAEAE4', color: '#5F5E5A' }
}

const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

function OverdueTasks({ tasks }: Props) {
  const navigate = useNavigate()

  if (tasks.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '64px 24px',
        background: '#ffffff', borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.07)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          width: '52px', height: '52px', background: '#E1F5EE',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <AlertTriangle size={24} color="#1D9E75" />
        </div>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#2C2C2A', margin: '0 0 6px' }}>
          No overdue tasks!
        </p>
        <p style={{ fontSize: '13px', color: '#888780', margin: 0 }}>
          You're all caught up. Great work!
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '8px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {tasks.map(task => (
        <div
          key={task.id}
          style={{
            background: '#ffffff',
            border: '1px solid #F7C1C1',
            borderLeft: '3px solid #E24B4A',
            borderRadius: '0 12px 12px 0',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Red dot */}
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#E24B4A', flexShrink: 0,
          }} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#2C2C2A' }}>
              {task.title}
            </div>
            {task.description && (
              <div style={{ fontSize: '12px', color: '#888780', marginTop: '2px' }}>
                {task.description}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                backgroundColor: priorityStyle(task.priority).bg,
                color: priorityStyle(task.priority).color,
              }}>
                {task.priority}
              </span>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                backgroundColor: statusStyle(task.status).bg,
                color: statusStyle(task.status).color,
              }}>
                {task.status}
              </span>
              <span style={{
                fontSize: '11px', color: '#A32D2D', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <AlertTriangle size={11} /> {task.deadline}
              </span>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                fontWeight: 700, background: '#FCEBEB', color: '#E24B4A',
              }}>
                {daysLate(task.deadline)}d late
              </span>
            </div>
          </div>

          {/* View project button */}
          <button
            onClick={() => navigate(`/projects/${task.project}`)}
            style={{
              background: 'transparent', border: '1px solid #E0DFD8',
              borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
              color: '#888780', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '5px', flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            View Project <ArrowRight size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default OverdueTasks