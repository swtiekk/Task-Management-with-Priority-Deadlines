import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import OverduePage from './pages/OverduePage'
import ProfilePage from './pages/ProfilePage'

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
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/projects" element={<Layout><ProjectPage /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
        <Route path="/overdue" element={<Layout><OverduePage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App