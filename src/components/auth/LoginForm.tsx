import { useState } from 'react'
import { LockKeyhole, UserRound } from 'lucide-react'

interface LoginFormValues {
  userId: string
  password: string
}

interface LoginFormProps {
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: LoginFormValues) => Promise<void>
}

export const LoginForm = ({ isSubmitting, error, onSubmit }: LoginFormProps) => {
  const [values, setValues] = useState<LoginFormValues>({ userId: '', password: '' })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const validate = (): boolean => {
    if (!values.userId.trim() || !values.password.trim()) {
      setValidationError('Completa userId y password.')
      return false
    }

    const userIdRegex = /^[a-zA-Z0-9_-]{3,40}$/
    if (!userIdRegex.test(values.userId)) {
      setValidationError('El userId debe ser alfanumerico (3-40), con guion o guion bajo.')
      return false
    }

    if (values.password.length < 8) {
      setValidationError('El password debe tener al menos 8 caracteres.')
      return false
    }

    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    await onSubmit(values)
  }

  const message = validationError ?? error

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Acceso a plataforma IA</h1>
        <p className="mt-1 text-sm text-slate-600">Inicia sesion o registrate para enviar prompts y monitorear cuotas.</p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        User ID
        <div className="mt-1 flex items-center border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500">
          <UserRound className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            className="ml-2 w-full border-none bg-transparent p-0 text-sm text-slate-900 outline-none"
            value={values.userId}
            onChange={(event) => handleChange('userId', event.target.value)}
            autoComplete="username"
            maxLength={40}
          />
        </div>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password
        <div className="mt-1 flex items-center border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-500">
          <LockKeyhole className="h-4 w-4 text-slate-500" />
          <input
            type="password"
            className="ml-2 w-full border-none bg-transparent p-0 text-sm text-slate-900 outline-none"
            value={values.password}
            onChange={(event) => handleChange('password', event.target.value)}
            autoComplete="current-password"
            minLength={8}
            maxLength={72}
          />
        </div>
      </label>

      {message && <p className="text-sm text-red-700">{message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-400"
      >
        {isSubmitting ? 'Ingresando...' : 'Entrar'}
      </button>
    </form>
  )
}
