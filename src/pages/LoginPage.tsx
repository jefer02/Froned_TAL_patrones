import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async ({ userId, password }: { userId: string; password: string }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await login({ userId, password })
      navigate('/app', { replace: true })
    } catch {
      setError('No se pudo iniciar sesion. Verifica tus credenciales.')
    } finally {
      setIsSubmitting(false)
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

        <LoginForm isSubmitting={isSubmitting} error={error} onSubmit={handleLogin} />
      </div>
    </main>
  )
}
