import { Pencil, Trash2, AlertTriangle, Check } from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Completed'
  deadline: string
  is_overdue: boolean
}

interface Props {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
}

const priorityStyle = (p: string) => {
  if (p === 'High') return { bg: 'var(--danger-light)', color: 'var(--danger)' }
  if (p === 'Medium') return { bg: 'var(--warning-light)', color: '#633806' }
  return { bg: 'var(--success-light)', color: '#085041' }
}

const statusStyle = (s: string) => {
  if (s === 'Completed') return { bg: 'var(--success-light)', color: '#085041' }
  if (s === 'In Progress') return { bg: 'var(--info-light)', color: '#185FA5' }
  return { bg: 'var(--bg2)', color: 'var(--text-muted)' }
}

function TaskList({ tasks, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '48px',
        background: 'var(--surface)', borderRadius: '12px',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--accent-light)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 12px',
        }}>
          <Check size={20} color="var(--accent)" />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          No tasks found
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Add a task to get started
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tasks.map(task => {
        const isDone = task.status === 'Completed'
        const isOverdue = task.is_overdue

        return (
          <div key={task.id} style={{
            background: 'var(--surface)',
            border: `1px solid ${isOverdue ? 'var(--danger-light)' : 'var(--border)'}`,
            borderLeft: `3px solid ${isOverdue ? 'var(--danger)' : isDone ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: isOverdue || isDone ? '0 12px 12px 0' : '12px',
            padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            opacity: isDone ? 0.65 : 1,
            transition: 'box-shadow 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}>

            {/* Check indicator */}
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              border: isDone ? 'none' : '2px solid var(--border-soft)',
              backgroundColor: isDone ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDone && <Check size={11} color="#fff" strokeWidth={3} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px', fontWeight: 500,
                color: isDone ? 'var(--text-hint)' : 'var(--text-primary)',
                textDecoration: isDone ? 'line-through' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {task.title}
              </div>
              {task.description && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
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
                  fontSize: '11px', fontWeight: isOverdue ? 600 : 400,
                  color: isOverdue ? 'var(--danger)' : 'var(--text-hint)',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  {isOverdue && <AlertTriangle size={11} />}
                  {task.deadline}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => onEdit(task)} style={{
                background: 'transparent', border: '1px solid var(--border-soft)',
                borderRadius: '7px', padding: '5px 10px', fontSize: '12px',
                color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '4px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}>
                <Pencil size={11} /> Edit
              </button>
              <button onClick={() => onDelete(task.id)} style={{
                background: 'transparent', border: '1px solid var(--danger-light)',
                borderRadius: '7px', padding: '5px 10px', fontSize: '12px',
                color: 'var(--danger)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '4px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList