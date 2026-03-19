import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  onSubmit: (data: { name: string; description: string }) => void
  onCancel: () => void
  error: string
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

function ProjectForm({ onSubmit, onCancel, error }: Props) {
  const [formData, setFormData] = useState({ name: '', description: '' })

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '12px',
      padding: '22px',
      marginBottom: '22px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 18px', color: '#2C2C2A' }}>
        New Project
      </h2>

      {error && (
        <div style={{
          background: '#FCEBEB', border: '1px solid #F7C1C1',
          borderRadius: '8px', padding: '10px 14px',
          fontSize: '13px', color: '#A32D2D',
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Project Name *</label>
        <input
          type="text"
          placeholder="e.g. Website Redesign"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          placeholder="What is this project about?"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onSubmit(formData)}
          style={{
            backgroundColor: '#1D9E75', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '9px 20px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Create Project
        </button>
        <button
          onClick={onCancel}
          style={{
            backgroundColor: 'transparent', color: '#888780',
            border: '1px solid #E0DFD8', borderRadius: '8px',
            padding: '9px 20px', fontSize: '13px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ProjectForm