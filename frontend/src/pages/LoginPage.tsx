import React from 'react'
import LoginForm from '../components/LoginForm'

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}

export default LoginPage
