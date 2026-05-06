import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
<<<<<<< HEAD
import type { JSX } from 'react'
=======
>>>>>>> 8224f62d054782341a71003b6335b6195a750d10
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import OverduePage from './pages/OverduePage'
<<<<<<< HEAD
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
=======
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user')
  return user ? <>{children}</> : <Navigate to="/login" replace />
>>>>>>> 8224f62d054782341a71003b6335b6195a750d10
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
<<<<<<< HEAD
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><HomePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout><ProjectPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <Layout><ProjectDetailPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/overdue" element={
          <ProtectedRoute>
            <Layout><OverduePage /></Layout>
          </ProtectedRoute>
        } />
        
=======
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<PrivateRoute><Layout><HomePage /></Layout></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Layout><ProjectPage /></Layout></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><Layout><ProjectDetailPage /></Layout></PrivateRoute>} />
        <Route path="/overdue" element={<PrivateRoute><Layout><OverduePage /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
>>>>>>> 8224f62d054782341a71003b6335b6195a750d10
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
