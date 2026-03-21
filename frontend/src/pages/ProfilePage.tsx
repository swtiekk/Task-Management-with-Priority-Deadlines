import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Shield, Settings, LogOut, Camera, Bell, CheckCircle2, Clock, Save, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../api/axios'

interface Stats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
}

interface Task {
  id: number
  title: string
  status: string
  is_overdue: boolean
}

interface UserProfile {
  name: string
  role: string
  email: string
  joinedDate: string
  admin: boolean
  notifications: boolean
  privacyMode: boolean
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile')
    return saved ? JSON.parse(saved) : {
      name: 'Alex Xavier',
      role: 'Product Manager',
      email: 'alex.xavier@example.com',
      joinedDate: 'March 2024',
      admin: true,
      notifications: true,
      privacyMode: false
    }
  })

  // Stats state
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [, taskRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/tasks/'),
        ])
        
        const tasks = taskRes.data
        const completed = tasks.filter((t: any) => t.status === 'Completed').length
        const overdue = tasks.filter((t: any) => t.is_overdue).length
        
        setStats({
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: tasks.length - completed,
          overdueTasks: overdue
        })
      } catch (error) {
        console.error("Failed to fetch profile stats", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSave = () => {
    localStorage.setItem('user_profile', JSON.stringify(profile))
    setIsEditing(false)
    showToast('Profile updated successfully!')
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      // For demo: clear profile and redirect
      localStorage.removeItem('user_profile')
      navigate('/')
      window.location.reload()
    }
  }

  const togglePreference = (key: keyof UserProfile) => {
    const updated = { ...profile, [key]: !profile[key] }
    setProfile(updated as UserProfile)
    localStorage.setItem('user_profile', JSON.stringify(updated))
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} preference updated.`)
  }

  const sectionStyle: React.CSSProperties = {
    background: isDark ? '#1F2937' : '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'block'
  }

  const infoStyle: React.CSSProperties = {
    fontSize: '15px',
    color: isDark ? '#F9FAFB' : '#1C1C1A',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
    background: isDark ? '#111827' : '#F9FAFB',
    color: isDark ? '#F9FAFB' : '#1C1C1A',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  return (
    <div style={{
      padding: '32px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif",
      color: isDark ? '#F9FAFB' : '#1C1C1A',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#1C1C1A', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideIn .2s ease',
        }}>
          ✓ {toast}
        </div>
      )}

      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '32px', fontWeight: 400, margin: 0, marginBottom: '8px' }}>
            My Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
            {isEditing ? 'Editing your personal information' : 'Manage your personal information and preferences'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                style={{
                  background: isDark ? '#374151' : '#F3F4F6',
                  color: isDark ? '#F9FAFB' : '#1C1C1A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{
                  background: '#1D9E75',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              style={{
                background: '#0097A7',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Settings size={16} /> Edit Profile
            </button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column - Avatar & Quick Info */}
        <div>
          <div style={sectionStyle}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #0097A7 0%, #00696F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#fff',
                fontFamily: "'DM Serif Display', serif",
                boxShadow: '0 8px 24px rgba(0,151,167,0.2)'
              }}>
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isDark ? '#374151' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0097A7'
              }}>
                <Camera size={18} />
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', fontWeight: 600 }}
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                  <input 
                    style={{ ...inputStyle, textAlign: 'center' }}
                    value={profile.role}
                    onChange={e => setProfile({...profile, role: e.target.value})}
                  />
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px 0' }}>{profile.name}</h2>
                  <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>{profile.role}</p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, paddingTop: '20px' }}>
              <div>
                <span style={labelStyle}>Email</span>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                  />
                ) : (
                  <div style={infoStyle}><Mail size={16} color="#0097A7" /> {profile.email}</div>
                )}
              </div>
              <div>
                <span style={labelStyle}>Joined</span>
                <div style={infoStyle}><Calendar size={16} color="#0097A7" /> {profile.joinedDate}</div>
              </div>
              <div>
                <span style={labelStyle}>Account Type</span>
                <div style={infoStyle}><Shield size={16} color="#0097A7" /> {profile.admin ? 'Administrator' : 'User'}</div>
              </div>
            </div>
          </div>

          <div style={{ ...sectionStyle, padding: '16px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column - Stats & Preferences */}
        <div>
          <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / span 2', marginBottom: '8px' }}>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', margin: 0 }}>Activity Overview</h3>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(0,151,167,0.1)' : '#F0FAFA', border: `1px solid ${isDark ? 'rgba(0,151,167,0.2)' : '#E0F2F1'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} color="#0097A7" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#0097A7' : '#00796B' }}>Completed</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{loading ? '...' : stats.completedTasks}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Tasks finished successfully</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Clock size={18} color="#F59E0B" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F59E0B' : '#92400E' }}>Pending</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{loading ? '...' : stats.pendingTasks}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Tasks currently in progress</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Bell size={18} color="#EF4444" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#EF4444' : '#991B1B' }}>Overdue</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{loading ? '...' : stats.overdueTasks}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Tasks past their deadline</div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <User size={18} color="#6B7280" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Tasks</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{loading ? '...' : stats.totalTasks}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Assigned across all projects</div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', margin: '0 0 20px 0' }}>Preferences</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Email Notifications</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Receive daily summary of tasks</div>
                </div>
                <div 
                  onClick={() => togglePreference('notifications')}
                  style={{ 
                    width: '40px', 
                    height: '20px', 
                    background: profile.notifications ? '#0097A7' : (isDark ? '#374151' : '#E5E7EB'), 
                    borderRadius: '20px', 
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: profile.notifications ? '22px' : '2px', 
                    top: '2px', 
                    width: '16px', 
                    height: '16px', 
                    background: '#fff', 
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Privacy Mode</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Hide task details from others</div>
                </div>
                <div 
                  onClick={() => togglePreference('privacyMode')}
                  style={{ 
                    width: '40px', 
                    height: '20px', 
                    background: profile.privacyMode ? '#0097A7' : (isDark ? '#374151' : '#E5E7EB'), 
                    borderRadius: '20px', 
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: profile.privacyMode ? '22px' : '2px', 
                    top: '2px', 
                    width: '16px', 
                    height: '16px', 
                    background: '#fff', 
                    borderRadius: '50%',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
