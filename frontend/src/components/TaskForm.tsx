import { AlertCircle } from 'lucide-react'

interface FormData {
  title: string; description: string; priority: string; status: string; deadline: string
}

interface Props {
  formData: FormData; isEdit: boolean; error: string
  onChange: (data: FormData) => void; onSubmit: () => void; onCancel: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: '13px',
  border: '1px solid var(--border-soft)', borderRadius: '8px',
  backgroundColor: 'var(--bg)', color: 'var(--text-primary)',
  outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--text-muted)', display: 'block',
  marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
}

function TaskForm({ formData, isEdit, error, onChange, onSubmit, onCancel }: Props) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '22px', marginBottom: '22px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 18px' }}>
        {isEdit ? 'Edit Task' : 'New Task'}
      </h2>

      {error && (
        <div style={{
          background: 'var(--danger-light)', border: '1px solid #F7C1C1',
          borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
          color: 'var(--danger)', marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Title *</label>
          <input type="text" placeholder="Task title" value={formData.title}
            onChange={e => onChange({ ...formData, title: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <textarea placeholder="Task description" value={formData.description}
            onChange={e => onChange({ ...formData, description: e.target.value })}
            rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select value={formData.priority} onChange={e => onChange({ ...formData, priority: e.target.value })} style={inputStyle}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={formData.status} onChange={e => onChange({ ...formData, status: e.target.value })} style={inputStyle}>
            <option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Deadline *</label>
          <input type="date" value={formData.deadline}
            onChange={e => onChange({ ...formData, deadline: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onSubmit} style={{
          backgroundColor: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 20px', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>
          {isEdit ? 'Save Changes' : 'Create Task'}
        </button>
        <button onClick={onCancel} style={{
          backgroundColor: 'transparent', color: 'var(--text-muted)',
          border: '1px solid var(--border-soft)', borderRadius: '8px',
          padding: '9px 20px', fontSize: '13px',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TaskForm