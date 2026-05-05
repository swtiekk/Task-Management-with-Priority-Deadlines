import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import OverduePage from './pages/OverduePage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user')
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '80px 32px', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#fafaf8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '72px', fontWeight: 800, color: '#E0DFD8', fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>404</div>
      <p style={{ fontSize: '20px', color: '#1C1C1A', fontFamily: "'DM Serif Display', serif", marginTop: '16px', marginBottom: '8px' }}>Page not found</p>
      <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '28px' }}>The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        style={{ background: '#0097A7', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
      >
        Go to Overview
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<PrivateRoute><Layout><HomePage /></Layout></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Layout><ProjectPage /></Layout></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><Layout><ProjectDetailPage /></Layout></PrivateRoute>} />
        <Route path="/overdue" element={<PrivateRoute><Layout><OverduePage /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App