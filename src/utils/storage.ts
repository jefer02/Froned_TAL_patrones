import type { UserCredentials } from '../types/api'

const AUTH_SESSION_KEY = 'tal_ai_auth_session'

interface AuthSession {
  userId: string
  encryptedPassword: string
}

export const storage = {
  getAuthSession: (): AuthSession | null => {
    const raw = localStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as AuthSession
    } catch {
      return null
    }
  },
  setAuthSession: (credentials: UserCredentials): void => {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(credentials))
  },
  clearAuthSession: (): void => localStorage.removeItem(AUTH_SESSION_KEY)
}
