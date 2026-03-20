import React from 'react'
import RegisterForm from '../components/RegisterForm'

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}

export default RegisterPage
