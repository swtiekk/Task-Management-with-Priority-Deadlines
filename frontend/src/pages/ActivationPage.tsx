import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'   // ← Updated import

export default function ActivationPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    api.post('/v1/auth/users/activation/', { uid, token })
      .then(() => {
        setStatus('success')
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              navigate('/login')
            }
            return prev - 1
          })
        }, 1000)
      })
      .catch(() => {
        setStatus('error')
      })
  }, [uid, token, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e8f4f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
      }}>

        {/* Top bar */}
        <div style={{
          background: '#0097A7',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="3" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>
            TaskFlow
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '48px 40px', textAlign: 'center' }}>

          {/* ── LOADING ── */}
          {status === 'loading' && (
            <>
              <div style={{
                width: '72px', height: '72px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #0097A7',
                borderRadius: '50%',
                margin: '0 auto 28px auto',
                animation: 'spin 0.9s linear infinite',
              }} />
              <h2 style={{
                fontSize: '22px', fontWeight: 700,
                color: '#0f172a', margin: '0 0 10px 0',
                letterSpacing: '-0.3px',
              }}>
                Verifying Your Account
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                Please wait while we activate your account.<br />
                This will only take a moment.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #0097A7, #00bcd4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px auto',
                boxShadow: '0 8px 24px rgba(0,151,167,0.3)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 style={{
                fontSize: '24px', fontWeight: 700,
                color: '#0f172a', margin: '0 0 10px 0',
                letterSpacing: '-0.3px',
              }}>
                Account Activated Successfully
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px 0', lineHeight: 1.6 }}>
                Your email address has been verified and your account<br />
                is now active. You may now sign in to TaskFlow.
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '28px' }} />

              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                Redirecting to login in{' '}
                <span style={{ fontWeight: 700, color: '#0097A7' }}>{countdown}s</span>
              </p>

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '13px',
                  background: '#0097A7', color: '#ffffff',
                  border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.02em', transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#00838f')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0097A7')}
              >
                Sign In Now
              </button>
            </>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px auto',
                boxShadow: '0 8px 24px rgba(239,68,68,0.25)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <h2 style={{
                fontSize: '24px', fontWeight: 700,
                color: '#0f172a', margin: '0 0 10px 0',
                letterSpacing: '-0.3px',
              }}>
                Activation Failed
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px 0', lineHeight: 1.6 }}>
                The activation link is invalid or has already expired.<br />
                Please register again to receive a new verification link.
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: '28px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    width: '100%', padding: '13px',
                    background: '#0097A7', color: '#ffffff',
                    border: 'none', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#00838f')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0097A7')}
                >
                  Create New Account
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '13px',
                    background: 'transparent', color: '#64748b',
                    border: '1.5px solid #e2e8f0', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#0097A7')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          padding: '16px 40px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
            © 2025 TaskFlow. All rights reserved.
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