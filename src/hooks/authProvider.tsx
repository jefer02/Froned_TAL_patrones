import { useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { usageApi } from '../api/usageApi'
import { ApiError } from '../api/httpClient'
import { storage } from '../utils/storage'
import { encryptPassword } from '../utils/crypto'
import type { User, UserCredentials } from '../types/api'
import { AuthContext, type AuthContextValue } from './authContext'

interface LoginPayload {
  userId: string
  password: string
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [credentials, setCredentials] = useState<UserCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const persistedSession = storage.getAuthSession()
      if (!persistedSession) {
        setIsLoading(false)
        return
      }

      try {
        const status = await usageApi.getStatus(persistedSession)
        setCredentials(persistedSession)
        setUser({
          userId: status.userId,
          plan: status.currentPlan
        })
      } catch {
        storage.clearAuthSession()
        setCredentials(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  const login = async ({ userId, password }: LoginPayload): Promise<void> => {
    const passwordEncrypted = await encryptPassword(password)
    const session: UserCredentials = {
      userId,
      encryptedPassword: passwordEncrypted
    }

    try {
      await authApi.register(session)
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 409) {
        throw error
      }
    }

    const status = await usageApi.getStatus(session)

    storage.setAuthSession(session)
    setCredentials(session)
    setUser({
      userId: status.userId,
      plan: status.currentPlan
    })
  }

  const logout = (): void => {
    storage.clearAuthSession()
    setCredentials(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      credentials,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout
    }),
    [user, credentials, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
