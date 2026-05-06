interface Props {
  priority: string
  status: string
  onPriorityChange: (value: string) => void
  onStatusChange: (value: string) => void
}

const pillStyle = (active: boolean, activeColor = 'var(--accent)'): React.CSSProperties => ({
  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
  border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
  backgroundColor: active ? activeColor : 'var(--surface)',
  color: active ? '#fff' : 'var(--text-muted)',
  borderColor: active ? activeColor : 'var(--border-soft)',
  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' as const,
})

const divider: React.CSSProperties = {
  width: '1px', height: '20px', background: 'var(--border-soft)', margin: '0 2px', alignSelf: 'center',
}

function TaskFilter({ priority, status, onPriorityChange, onStatusChange }: Props) {
  const priorities = ['All', 'Low', 'Medium', 'High']
  const statuses = ['All', 'Pending', 'In Progress', 'Completed']

  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <span style={{ fontSize: '11px', color: 'var(--text-hint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>
        Priority
      </span>
      {priorities.map(p => (
        <button key={p} onClick={() => onPriorityChange(p === 'All' ? '' : p)}
          style={pillStyle((p === 'All' && !priority) || priority === p, 'var(--accent)')}>
          {p}
        </button>
      ))}

      <div style={divider} />

      <span style={{ fontSize: '11px', color: 'var(--text-hint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>
        Status
      </span>
      {statuses.map(s => (
        <button key={s} onClick={() => onStatusChange(s === 'All' ? '' : s)}
          style={pillStyle((s === 'All' && !status) || status === s, 'var(--text-primary)')}>
          {s}
        </button>
      ))}
    </div>
  )
}

export default TaskFilter