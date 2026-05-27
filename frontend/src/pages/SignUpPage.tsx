import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { clearSession, storeSession } from '../api/auth'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password !== rePassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      clearSession()
      await axios.post('http://localhost:8000/api/v1/auth/users/', {
        email,
        password,
        re_password: rePassword,
      })

      // Auto-login after signup
      const tokenRes = await axios.post('http://localhost:8000/api/v1/auth/jwt/create/', {
        email,
        password,
      })

      const accessToken = tokenRes.data.access
      const refreshToken = tokenRes.data.refresh

      const userRes = await axios.get('http://localhost:8000/api/v1/auth/users/me/', {
        headers: { Authorization: `JWT ${accessToken}` },
      })

      storeSession(accessToken, userRes.data, refreshToken)
      navigate('/profile')

    } catch (err: any) {
      const data = err.response?.data
      if (data) {
        const messages = Object.values(data).flat()
        setError((messages[0] as string) || 'Registration failed.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom: '7px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        display: 'flex',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '780px',
      }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          background: '#0097A7',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="3" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>

            <h1 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px',
            }}>
              TaskFlow
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6,
              margin: '0 0 36px 0',
            }}>
              Manage tasks smarter,<br />deliver projects faster.
            </p>

            {[
              'Priority-based task management',
              'Deadline tracking & overdue alerts',
              'Team collaboration & projects',
              'Real-time activity overview',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.6)', flexShrink: 0,
                }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{f}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            © 2025 TaskFlow. All rights reserved.
          </p>
        </div>

        {/* ── Right Panel ── */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
          }}>
            Create account
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 28px 0' }}>
            Sign up to get started with TaskFlow
          </p>

          <form onSubmit={handleSignUp}>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0097A7'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0097A7'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0097A7'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={rePassword}
                onChange={e => setRePassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0097A7'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#67b8c1' : '#0097A7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>Create account →</>
              )}
            </button>

          </form>

          <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '24px' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#0097A7', fontWeight: 600, cursor: 'pointer' }}>
              Sign in
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
