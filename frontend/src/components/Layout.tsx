import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Trash2, Clock } from 'lucide-react'
import api from '../api/axios'

interface Project {
  id: number
  name: string
  overdue_tasks: number
}

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#E24B4A', '#7F77DD', '#D85A30']

const hov = (e: React.MouseEvent, bg: string) =>
  ((e.currentTarget as HTMLDivElement).style.background = bg)

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<Project[]>([])
  const [totalOverdue, setTotalOverdue] = useState(0)

  useEffect(() => { fetchProjects() }, [location.pathname])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/')
      setProjects(res.data)
      setTotalOverdue(res.data.reduce((s: number, p: Project) => s + p.overdue_tasks, 0))
    } catch { /* silent */ }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its tasks?')) return
    try { await api.delete(`/projects/${id}/`); fetchProjects() }
    catch { /* silent */ }
  }

  const isActive = (path: string) => location.pathname === path
  const isProjectActive = (id: number) => location.pathname === `/projects/${id}`

  const S = {
    shell: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      backgroundColor: '#F5F4EF',
    } as React.CSSProperties,
    sidebar: {
      width: '200px',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid rgba(0,0,0,0.07)',
      padding: '28px 16px',
      display: 'flex',
      flexDirection: 'column' as const,
      flexShrink: 0,
    },
    brand: {
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '0 6px', marginBottom: '36px',
    },
    brandMark: {
      width: '30px', height: '30px', background: '#1C1C1A', borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    brandName: {
      fontFamily: "'DM Serif Display', serif", fontSize: '16px', color: '#1C1C1A',
    },
    groupLabel: {
      fontSize: '9px', fontWeight: 500, color: '#B8B7B0', letterSpacing: '0.1em',
      textTransform: 'uppercase' as const, padding: '0 10px',
      marginBottom: '8px', display: 'block',
    },
    navItem: (active: boolean): React.CSSProperties => ({
      display: 'flex', alignItems: 'center', gap: '9px',
      padding: '8px 10px', borderRadius: '8px', fontSize: '12px',
      color: active ? '#0F6E56' : '#8C8B85',
      fontWeight: active ? 500 : 400,
      backgroundColor: active ? '#E8F5F0' : 'transparent',
      cursor: 'pointer', transition: 'all .15s', marginBottom: '1px',
    }),
    badge: (danger?: boolean): React.CSSProperties => ({
      marginLeft: 'auto', fontSize: '10px', fontWeight: 500,
      padding: '1px 6px', borderRadius: '10px',
      background: danger ? '#FEF0F0' : '#F0EFEA',
      color: danger ? '#E24B4A' : '#8C8B85',
    }),
    dot: (color: string): React.CSSProperties => ({
      width: '7px', height: '7px', borderRadius: '2px',
      backgroundColor: color, flexShrink: 0,
    }),
    divider: {
      height: '1px', background: 'rgba(0,0,0,0.06)', margin: '16px 0',
    },
    footer: {
      marginTop: 'auto', paddingTop: '16px',
      borderTop: '1px solid rgba(0,0,0,0.06)',
    },
    main: {
      flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0,
    },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <div style={S.shell}>

        {/* ── Sidebar ── */}
        <aside style={S.sidebar}>

          {/* Brand */}
          <div style={S.brand}>
            <div style={S.brandMark}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
                <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".45" />
                <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".45" />
                <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".2" />
              </svg>
            </div>
            <span style={S.brandName}>Taskr</span>
          </div>

          {/* Menu */}
          <div style={{ marginBottom: '24px' }}>
            <span style={S.groupLabel}>Menu</span>
            <div
              style={S.navItem(isActive('/'))}
              onClick={() => navigate('/')}
              onMouseEnter={e => { if (!isActive('/')) hov(e, '#F5F4EF') }}
              onMouseLeave={e => { if (!isActive('/')) hov(e, 'transparent') }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" />
                <rect x="8" y="1" width="4" height="4" rx="1" fill="currentColor" opacity=".4" />
                <rect x="1" y="8" width="4" height="4" rx="1" fill="currentColor" opacity=".4" />
                <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor" opacity=".4" />
              </svg>
              Overview
            </div>
            <div
              style={S.navItem(isActive('/projects'))}
              onClick={() => navigate('/projects')}
              onMouseEnter={e => { if (!isActive('/projects')) hov(e, '#F5F4EF') }}
              onMouseLeave={e => { if (!isActive('/projects')) hov(e, 'transparent') }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 3.5h10M1.5 6.5h7M1.5 9.5h8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              All Tasks
            </div>
            <div
              style={S.navItem(isActive('/overdue'))}
              onClick={() => navigate('/overdue')}
              onMouseEnter={e => { if (!isActive('/overdue')) hov(e, '#F5F4EF') }}
              onMouseLeave={e => { if (!isActive('/overdue')) hov(e, 'transparent') }}
            >
              <Clock size={13} />
              Overdue
              {totalOverdue > 0 && <span style={S.badge(true)} title={`${totalOverdue} overdue task${totalOverdue !== 1 ? 's' : ''}`}>{totalOverdue}</span>}
            </div>
          </div>

          <div style={S.divider} />

          {/* Projects */}
          <div style={{ marginBottom: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', marginBottom: '8px' }}>
              <span style={{ ...S.groupLabel, padding: 0, margin: 0 }}>Projects</span>
              <button
                onClick={() => navigate('/projects')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D9E75', display: 'flex', padding: '2px' }}
              >
                <Plus size={13} />
              </button>
            </div>

            {projects.map((p, i) => (
              <div
                key={p.id}
                style={S.navItem(isProjectActive(p.id))}
                onClick={() => navigate(`/projects/${p.id}`)}
                onMouseEnter={e => { if (!isProjectActive(p.id)) hov(e, '#F5F4EF') }}
                onMouseLeave={e => { if (!isProjectActive(p.id)) hov(e, 'transparent') }}
              >
                <div style={S.dot(COLORS[i % COLORS.length])} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {p.overdue_tasks > 0 && <span style={S.badge(true)}>{p.overdue_tasks}</span>}
                <button
                  onClick={e => handleDelete(p.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D3D1C7', padding: '2px', display: 'flex' }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <div
              style={{ ...S.navItem(false), color: '#B8B7B0' }}
              onMouseEnter={e => hov(e, '#F5F4EF')}
              onMouseLeave={e => hov(e, 'transparent')}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 11c0-2.21 2.24-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Profile
            </div>
          </div>

        </aside>

        {/* ── Page content ── */}
        <div style={S.main}>
          {children}
        </div>

      </div>
    </>
  )
}

export default Layout