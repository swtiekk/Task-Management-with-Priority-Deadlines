import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import '../Auth.css'

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)
    try {
      await axios.post('http://127.0.0.1:8000/auth/users/', {
        username: email,
        email: email,
        password: password,
      })

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      const data = err.response?.data
      let errorMsg = 'Registration failed. Please try again.'

      if (data) {
        if (data.username) errorMsg = `Username: ${data.username[0]}`
        else if (data.email) errorMsg = `Email: ${data.email[0]}`
        else if (data.password) errorMsg = `Password: ${data.password[0]}`
        else if (data.non_field_errors) errorMsg = data.non_field_errors[0]
        else if (Array.isArray(data)) errorMsg = data[0]
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-success-screen">
          <div className="auth-success-icon">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="auth-title">Success!</h2>
          <p className="auth-subtitle">Your account has been created. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-icon-wrapper">
          <UserPlus size={32} />
        </div>
        <h2 className="auth-title">Get Started</h2>
        <p className="auth-subtitle">Create an account to manage your projects</p>
      </div>

      {error && (
        <div className="auth-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
