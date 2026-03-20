import { useNavigate } from 'react-router-dom'
import { ListTodo, AlertTriangle, Trash2 } from 'lucide-react'

interface Project {
  id: number
  name: string
  description: string
  total_tasks: number
  overdue_tasks: number
}

interface Props { projects: Project[]; onDelete: (id: number) => void }

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#E24B4A', '#7F77DD', '#D85A30']

function ProjectList({ projects, onDelete }: Props) {
  const navigate = useNavigate()
  if (projects.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', fontFamily: "'DM Sans', sans-serif" }}>
      {projects.map((project, i) => (
        <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}>

          <div style={{ height: '3px', borderRadius: '3px', backgroundColor: COLORS[i % COLORS.length], marginBottom: '16px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1, letterSpacing: '-0.2px' }}>
              {project.name}
            </h3>
            <button onClick={e => { e.stopPropagation(); onDelete(project.id) }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-hint)', cursor: 'pointer', padding: '0 0 0 8px', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={13} />
            </button>
          </div>

          {project.description && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
              {project.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '14px', paddingTop: '12px', borderTop: '1px solid var(--bg2)', marginTop: project.description ? '0' : '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ListTodo size={12} color="var(--accent)" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{project.total_tasks} tasks</span>
            </div>
            {project.overdue_tasks > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={12} color="var(--danger)" />
                <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 600 }}>{project.overdue_tasks} overdue</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectList