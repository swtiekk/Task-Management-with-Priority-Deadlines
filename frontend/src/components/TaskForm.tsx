import { AlertCircle } from 'lucide-react'

interface FormData {
  title: string
  description: string
  priority: string
  status: string
  deadline: string
}

interface Props {
  formData: FormData
  isEdit: boolean
  error: string
  onChange: (data: FormData) => void
  onSubmit: () => void
  onCancel: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  border: '1px solid #E0DFD8',
  borderRadius: '8px',
  backgroundColor: '#F2F1EC',
  color: '#2C2C2A',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888780',
  display: 'block',
  marginBottom: '5px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function TaskForm({ formData, isEdit, error, onChange, onSubmit, onCancel }: Props) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '12px',
      padding: '22px',
      marginBottom: '22px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '18px', color: '#2C2C2A', margin: '0 0 18px' }}>
        {isEdit ? 'Edit Task' : 'New Task'}
      </h2>

      {error && (
        <div style={{
          background: '#FCEBEB', border: '1px solid #F7C1C1',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '13px', color: '#A32D2D', marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={e => onChange({ ...formData, title: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="Task description"
            value={formData.description}
            onChange={e => onChange({ ...formData, description: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Priority</label>
          <select
            value={formData.priority}
            onChange={e => onChange({ ...formData, priority: e.target.value })}
            style={inputStyle}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={formData.status}
            onChange={e => onChange({ ...formData, status: e.target.value })}
            style={inputStyle}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Deadline *</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={e => onChange({ ...formData, deadline: e.target.value })}
            style={inputStyle}
          />
        </div>

      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onSubmit}
          style={{
            backgroundColor: '#1D9E75', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '9px 20px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Task'}
        </button>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: 'transparent', color: '#888780',
            border: '1px solid #E0DFD8', borderRadius: '8px',
            padding: '9px 20px', fontSize: '13px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TaskForm