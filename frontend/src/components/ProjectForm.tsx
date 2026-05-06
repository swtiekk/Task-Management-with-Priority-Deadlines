import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  onSubmit: (data: { name: string; description: string }) => void
  onCancel: () => void
  error: string
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

function ProjectForm({ onSubmit, onCancel, error }: Props) {
  const [formData, setFormData] = useState({ name: '', description: '' })

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '22px', marginBottom: '22px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 18px', color: 'var(--text-primary)' }}>
        New Project
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

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Project Name *</label>
        <input type="text" placeholder="e.g. Website Redesign"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle} />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={labelStyle}>Description</label>
        <textarea placeholder="What is this project about?"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => onSubmit(formData)} style={{
          backgroundColor: 'var(--accent)', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 20px', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>
          Create Project
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

export default ProjectForm