import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Trash2, Clock, LayoutDashboard, FolderOpen } from 'lucide-react'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

interface Project {
  id: number
  name: string
  color: number
  overdue_tasks: number
}

const CARD_COLORS = [
  { dot: '#B8B7B0' },
  { dot: '#F59E0B' },
  { dot: '#1D9E75' },
  { dot: '#378ADD' },
  { dot: '#E24B4A' },
  { dot: '#7F77DD' },
  { dot: '#D85A30' },
  { dot: '#0097A7' },
  { dot: '#9C27B0' },
]

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<Project[]>([])
  const [totalOverdue, setTotalOverdue] = useState(0)
  const [toast, setToast] = useState('')
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => { fetchProjects() }, [location.pathname])

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/')
      setProjects(res.data)
      setTotalOverdue(res.data.reduce((s: number, p: Project) => s + p.overdue_tasks, 0))
    } catch { }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}/`)
      fetchProjects()
      showToast('Project deleted successfully.')
    } catch { showToast('Failed to delete project.') }
  }

  const isActive = (path: string) => location.pathname === path
  const isProjectActive = (id: number) => location.pathname === `/projects/${id}`

  const navItem = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '9px',
    padding: '9px 12px', borderRadius: '10px', fontSize: '13px',
    color: active ? '#0F6E56' : isDark ? '#9CA3AF' : '#6B7280',
    fontWeight: active ? 600 : 400,
    backgroundColor: active ? (isDark ? '#0F3D2E' : '#E8F5F0') : 'transparent',
    cursor: 'pointer', transition: 'all .15s', marginBottom: '2px',
    border: 'none', width: '100%', textAlign: 'left' as const,
  })

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#1C1C1A', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideIn .2s ease',
        }}>
          ✓ {toast}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E0DFD8; border-radius: 4px; }
      `}</style>

      <div style={{
        display: 'flex', minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: isDark ? '#111827' : '#fafaf8',
        color: isDark ? '#F9FAFB' : '#1C1C1A',
      }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px', height: '100vh',
          backgroundColor: isDark ? '#1F2937' : '#ffffff',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          padding: '24px 14px',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          position: 'sticky', top: 0, overflowY: 'auto',
        }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0F6E56', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity=".5" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".5" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity=".25" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '17px', color: isDark ? '#F9FAFB' : '#1C1C1A', fontWeight: 400 }}>
              TaskFlow
            </span>
          </div>

          {/* Menu */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#B8B7B0', letterSpacing: '.12em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '6px', display: 'block' }}>
              Menu
            </span>
            <button
              style={navItem(isActive('/'))}
              onClick={() => navigate('/')}
              onMouseEnter={e => { if (!isActive('/')) (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#374151' : '#F5F4EF' }}
              onMouseLeave={e => { if (!isActive('/')) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <LayoutDashboard size={14} /> Overview
            </button>
            <button
              style={navItem(isActive('/projects'))}
              onClick={() => navigate('/projects')}
              onMouseEnter={e => { if (!isActive('/projects')) (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#374151' : '#F5F4EF' }}
              onMouseLeave={e => { if (!isActive('/projects')) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <FolderOpen size={14} /> All Projects
            </button>
            <button
              style={{ ...navItem(isActive('/overdue')), color: isActive('/overdue') ? '#0F6E56' : totalOverdue > 0 ? '#A32D2D' : isDark ? '#9CA3AF' : '#6B7280' }}
              onClick={() => navigate('/overdue')}
              onMouseEnter={e => { if (!isActive('/overdue')) (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#374151' : '#F5F4EF' }}
              onMouseLeave={e => { if (!isActive('/overdue')) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Clock size={14} />
              Overdue
              {totalOverdue > 0 && (
                <span style={{ marginLeft: 'auto', background: '#FEF0F0', color: '#A32D2D', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', border: '1px solid #F7C1C1' }}>
                  {totalOverdue}
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', margin: '12px 0' }} />

          {/* Projects */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#B8B7B0', letterSpacing: '.12em', textTransform: 'uppercase' }}>
                Projects
              </span>
              <button
                onClick={() => navigate('/projects')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D9E75', display: 'flex', padding: '2px', borderRadius: '4px' }}
              >
                <Plus size={13} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              {projects.length === 0 && (
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#B8B7B0', fontStyle: 'italic' }}>
                  No projects yet
                </div>
              )}
              {projects.map((p) => (
                <div
                  key={p.id}
                  style={navItem(isProjectActive(p.id))}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  onMouseEnter={e => { if (!isProjectActive(p.id)) (e.currentTarget as HTMLDivElement).style.background = isDark ? '#374151' : '#F5F4EF' }}
                  onMouseLeave={e => { if (!isProjectActive(p.id)) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  role="button" tabIndex={0}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CARD_COLORS[(p.color && p.color > 0) ? p.color % CARD_COLORS.length : (p.id % (CARD_COLORS.length - 1)) + 1].dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                  {p.overdue_tasks > 0 && (
                    <span style={{ background: '#FEF0F0', color: '#A32D2D', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px' }}>
                      {p.overdue_tasks}
                    </span>
                  )}
                  <button
                    onClick={e => handleDelete(p.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D3D1C7', padding: '2px', display: 'flex', borderRadius: '4px' }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — Profile + Toggle */}
          <div style={{ paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            {/* 🌙 Dark mode toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <ThemeToggle />
            </div>
            <button
              style={{ ...navItem(false), color: isDark ? '#9CA3AF' : '#9CA3AF' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#374151' : '#F5F4EF'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Profile
            </button>
          </div>
        </aside>

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
          {children}
        </div>
      </div>
    </>
  )
}

export default Layout