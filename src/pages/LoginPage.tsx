import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../api/httpClient'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, register, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false)
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async ({ userId, password }: { userId: string; password: string }) => {
    setIsSubmittingLogin(true)
    setError(null)

    try {
      await login({ userId, password })
      navigate('/app', { replace: true })
    } catch (loginError) {
      if (loginError instanceof ApiError) {
        setError(loginError.message)
      } else {
        setError('No se pudo iniciar sesion. Verifica tus credenciales.')
      }
    } finally {
      setIsSubmittingLogin(false)
    }
  }

  const handleRegister = async ({ userId, password }: { userId: string; password: string }) => {
    setIsSubmittingRegister(true)
    setError(null)

    try {
      await register({ userId, password })
      navigate('/app', { replace: true })
    } catch (registerError) {
      if (registerError instanceof ApiError) {
        setError(registerError.message)
      } else {
        setError('No se pudo registrar el usuario. Intenta de nuevo.')
      }
    } finally {
      setIsSubmittingRegister(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:grid md:grid-cols-[1.1fr_1fr]">
        <section className="border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Taller</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Plataforma de consumo IA
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Proxy con control de rate limit y cuotas por plan. El frontend muestra consumo, estado de solicitudes y
            seguimiento en tiempo real.
          </p>
        </section>

        <LoginForm
          isSubmittingLogin={isSubmittingLogin}
          isSubmittingRegister={isSubmittingRegister}
          error={error}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    </main>
  )
}
